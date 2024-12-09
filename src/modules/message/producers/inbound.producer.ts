import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

import { EXCHANGE_NAMES, QUEUE_MESSAGE_HEADERS } from '@/config/constants';
import {
  InboundMediaMessageDto,
  InboundMessageDto,
} from '@/models/inbound-message.dto';

@Injectable()
export class InboundProducer {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(message: InboundMessageDto, retryCount = 0) {
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
          [QUEUE_MESSAGE_HEADERS.X_DELAY]: retryCount * 1000,
        },
      },
    );

    if (!sentToQueue) {
      //TODO: add some logging and store it in a table in the database for later reprocess
      throw new Error('Failed to send message to queue');
    }
  }

  async media(message: InboundMediaMessageDto, retryCount = 0) {
    const rabbitChannel = this.amqpConnection.channel;

    await rabbitChannel.assertExchange(EXCHANGE_NAMES.INBOUND, 'topic', {
      autoDelete: false,
      durable: true,
      alternateExchange: EXCHANGE_NAMES.INBOUND_DLX,
    });

    const sentToQueue = rabbitChannel.publish(
      EXCHANGE_NAMES.INBOUND,
      'media-process',
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        mandatory: true,
        headers: {
          [QUEUE_MESSAGE_HEADERS.X_RETRY_COUNT]: retryCount,
          [QUEUE_MESSAGE_HEADERS.X_DELAY]: retryCount * 1000,
        },
      },
    );

    if (!sentToQueue) {
      //TODO: add some logging and store it in a table in the database for later reprocess
      throw new Error(`Failed to send message to queue "${'media-process'}"`);
    }
  }
}
