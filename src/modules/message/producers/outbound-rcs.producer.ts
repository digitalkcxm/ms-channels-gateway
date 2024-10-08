import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvVars } from '@/config/env-vars';
import { BrokerType } from '@/modules/database/entities/enums';

@Injectable()
export class OutboundRcsProducer {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService<EnvVars>,
  ) {}

  async publish(data: unknown) {
    const exchangeName = this.configService.getOrThrow<string>(
      'RCS_OUTBOUND_EXCHANGE_NAME',
    );

    const channel = this.amqpConnection.channel;

    await channel.assertExchange(exchangeName, 'topic', {
      autoDelete: true,
      durable: true,
    });

    const sentToQueue = channel.publish(
      exchangeName,
      BrokerType.PONTAL_TECH,
      Buffer.from(
        JSON.stringify({
          data,
        }),
      ),
      {
        persistent: true,
        mandatory: true,
      },
    );

    if (!sentToQueue) {
      //TODO: add some logging and store it in a table in the database for later reprocess
      throw new Error('Failed to send message to queue');
    }
  }
}
