import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

import { EXCHANGE_NAMES, QUEUE_MESSAGE_HEADERS } from '@/config/constants';
import { InboundMessage } from '@/models/inbound-message.model';

@Injectable()
export class InboundProducer {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(message: InboundMessage, retryCount = 0) {
    const { broker, channel } = message;

    const rabbitChannel = this.amqpConnection.channel;

    await rabbitChannel.assertExchange(EXCHANGE_NAMES.INBOUND, 'topic', {
      autoDelete: false,
      durable: true,
      alternateExchange: EXCHANGE_NAMES.INBOUND_DLX,
    });

    const sentToQueue = rabbitChannel.publish(
      EXCHANGE_NAMES.INBOUND,
      `${channel}.${broker}`,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        mandatory: true,
        headers: {
          [QUEUE_MESSAGE_HEADERS.X_RETRY_COUNT]: retryCount,
        },
      },
    );

    if (!sentToQueue) {
      //TODO: add some logging and store it in a table in the database for later reprocess
      throw new Error('Failed to send message to queue');
    }
  }
}
