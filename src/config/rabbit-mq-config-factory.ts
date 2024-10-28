import { ModuleConfigFactory } from '@golevelup/nestjs-modules';
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CHANNELS, EXCHANGE_NAMES, QUEUE_NAMES } from './constants';
import { EnvVars } from './env-vars';

class AmqpConnectionFactory {
  private constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly secure?: boolean,
  ) {}

  private username?: string;
  private password?: string;

  static create(host: string, port: number, secure?: boolean) {
    return new AmqpConnectionFactory(host, port, secure);
  }

  withUsername(username: string) {
    this.username = username;
    return this;
  }

  withPassword(password: string) {
    this.password = password;
    return this;
  }

  build() {
    const protocol = this.secure ? 'amqps' : 'amqp';
    const password = this.password ? `:${this.password}` : '';
    const authSeparator = this.username ? '@' : '';

    return `${protocol}://${this.username}${password}${authSeparator}${this.host}:${this.port}`;
  }
}

@Injectable()
export class RabbitMQConfigFactory
  implements ModuleConfigFactory<RabbitMQConfig>
{
  constructor(private readonly configService: ConfigService<EnvVars>) {}

  createModuleConfig(): RabbitMQConfig | Promise<RabbitMQConfig> {
    const host = this.configService.getOrThrow<string>('RABBITMQ_HOST');
    const port = this.configService.get<number>('RABBITMQ_PORT', 5672);
    const secure = this.configService.get<boolean>('RABBITMQ_SECURE', false);
    const username = this.configService.get<string>('RABBITMQ_USERNAME');
    const password = this.configService.get<string>('RABBITMQ_PASSWORD');

    return {
      uri: AmqpConnectionFactory.create(host, port, secure)
        .withUsername(username)
        .withPassword(password)
        .build(),
      connectionInitOptions: {
        wait: false,
      },
      name: 'ms-channels-gateway',
      channels: {
        DEFAULT: {
          default: true,
          prefetchCount: 3,
        },
        [CHANNELS.INBOUND]: {
          prefetchCount: 10,
        },
        [CHANNELS.OUTBOUND]: {
          prefetchCount: 5,
        },
      },
      exchanges: [
        {
          name: EXCHANGE_NAMES.INBOUND,
          type: 'topic',
          createExchangeIfNotExists: true,
          options: {
            autoDelete: false,
            durable: true,
            alternateExchange: EXCHANGE_NAMES.INBOUND_DLX,
          },
        },
        {
          name: EXCHANGE_NAMES.INBOUND_DLX,
          type: 'fanout',
          createExchangeIfNotExists: true,
          options: {
            autoDelete: false,
            durable: true,
          },
        },
        {
          name: EXCHANGE_NAMES.OUTBOUND,
          type: 'topic',
          createExchangeIfNotExists: true,
          options: {
            autoDelete: false,
            durable: true,
            alternateExchange: EXCHANGE_NAMES.OUTBOUND_DLX,
          },
        },
        {
          name: EXCHANGE_NAMES.OUTBOUND_DLX,
          type: 'fanout',
          createExchangeIfNotExists: true,
          options: {
            autoDelete: false,
            durable: true,
          },
        },
      ],
      queues: [
        {
          name: QUEUE_NAMES.INBOUND_DEAD,
          exchange: EXCHANGE_NAMES.INBOUND_DLX,
          routingKey: '#',
          options: {
            autoDelete: false,
            durable: true,
          },
        },
        {
          name: QUEUE_NAMES.OUTBOUND_DEAD,
          exchange: EXCHANGE_NAMES.OUTBOUND_DLX,
          routingKey: '#',
          options: {
            autoDelete: false,
            durable: true,
          },
        },
      ],
      registerHandlers: true,
    };
  }
}
