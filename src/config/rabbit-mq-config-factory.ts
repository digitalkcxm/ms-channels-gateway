import { ModuleConfigFactory } from '@golevelup/nestjs-modules';
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CHANNELS_PREFETCH, EXCHANGE_NAMES, QUEUE_NAMES } from './constants';
import { EnvVars } from './env-vars';

@Injectable()
export class RabbitMQConfigFactory
  implements ModuleConfigFactory<RabbitMQConfig>
{
  constructor(private readonly configService: ConfigService<EnvVars>) {}

  createModuleConfig(): RabbitMQConfig | Promise<RabbitMQConfig> {
    const username = this.configService.getOrThrow<string>('RABBITMQ_USERNAME');
    const password = this.configService.getOrThrow<string>('RABBITMQ_PASSWORD');
    const host = this.configService.getOrThrow<string>('RABBITMQ_HOST');
    const port = this.configService.get<number>('RABBITMQ_PORT', 5672);
    const protocol = this.configService.get<boolean>('RABBITMQ_SECURE', false)
      ? 'amqps'
      : 'amqp';

    return {
      uri: `${protocol}://${username}:${password}@${host}:${port}/${username}`,
      connectionInitOptions: {
        wait: false,
      },
      name: 'ms-channels-gateway',
      channels: {
        DEFAULT: {
          default: true,
          prefetchCount: 1,
        },
        [CHANNELS_PREFETCH.INBOUND]: {
          prefetchCount: 10,
        },
        [CHANNELS_PREFETCH.OUTBOUND]: {
          prefetchCount: 5,
        },
      },
      exchanges: [
        {
          name: EXCHANGE_NAMES.INBOUND,
          type: 'topic',
          createExchangeIfNotExists: true,
          options: {
            autoDelete: true,
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
            autoDelete: true,
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
