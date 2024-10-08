import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QUEUE_NAMES } from '@/config/constants';
import { EnvVars } from '@/config/env-vars';
import { BrokerType, ChannelType } from '@/modules/database/entities/enums';

@Injectable()
export class OutboundProducer {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService<EnvVars>,
  ) {}

  async publish(
    channelType: ChannelType,
    brokerType: BrokerType,
    data: unknown,
  ) {
    const exchangeName = QUEUE_NAMES.OUTBOUND;
    const routingKey = `${channelType}.${brokerType}`;

    const channel = this.amqpConnection.channel;

    await channel.assertExchange(exchangeName, 'topic', {
      autoDelete: true,
      durable: true,
    });

    const sentToQueue = channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(
        JSON.stringify({
          data,
        }),
      ),
      {
        expiration: 60 * 60 * 1,
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
