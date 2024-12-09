import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

import { EXCHANGE_NAMES } from '@/config/constants';
import { BrokerType, ChannelType } from '@/models/enums';
import { OutboundMessageDto } from '@/models/outbound-message.dto';

@Injectable()
export class OutboundProducer {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(
    message: OutboundMessageDto,
    broker: BrokerType,
    channel: ChannelType,
  ) {
    const rabbitChannel = this.amqpConnection.channel;

    await rabbitChannel.assertExchange(EXCHANGE_NAMES.OUTBOUND, 'topic', {
      autoDelete: false,
      durable: true,
      alternateExchange: EXCHANGE_NAMES.OUTBOUND_DLX,
    });

    const sentToQueue = rabbitChannel.publish(
      EXCHANGE_NAMES.OUTBOUND,
      `${channel}.${broker}`,
      Buffer.from(JSON.stringify(message)),
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
