import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

import { EXCHANGE_NAMES } from '@/config/constants';
import { OutboundMessageDto } from '@/models/outbound-message.model';
import { ChannelConfigService } from '@/modules/entity-manager/channels-gateway/services/channel-config.service';

@Injectable()
export class OutboundProducer {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly channelConfigService: ChannelConfigService,
  ) {}

  async publish(message: OutboundMessageDto) {
    const { channelConfigId } = message;

    const channelConfig =
      await this.channelConfigService.getById(channelConfigId);

    if (!channelConfig) {
      throw new Error('Channel config not found');
    }

    const { broker, channel } = channelConfig;

    const rabbitChannel = this.amqpConnection.channel;

    await rabbitChannel.assertExchange(EXCHANGE_NAMES.OUTBOUND, 'topic', {
      autoDelete: true,
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
