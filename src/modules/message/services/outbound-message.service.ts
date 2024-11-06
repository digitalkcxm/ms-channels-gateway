import { BadRequestException, Injectable } from '@nestjs/common';

import { OutboundMessageDto } from '@/models/outbound-message.model';
import { ChannelConfigStatus } from '@/modules/database/channels-gateway/entities/enums';
import { ChannelConfigService } from '@/modules/entity-manager/channels-gateway/services/channel-config.service';

import { OutboundProducer } from '../producers/outbound.producer';

@Injectable()
export class OutboundMessageService {
  constructor(
    private readonly channelConfigService: ChannelConfigService,
    private readonly outboundProducer: OutboundProducer,
  ) {}

  async publish(message: OutboundMessageDto) {
    const { channelConfigId } = message;

    const channelConfig =
      await this.channelConfigService.getById(channelConfigId);

    if (!channelConfig) {
      throw new BadRequestException('Channel config not found');
    }

    if (channelConfig?.status === ChannelConfigStatus.DRAFT) {
      throw new BadRequestException('Channel config is in DRAFT status');
    }

    if (channelConfig?.status === ChannelConfigStatus.INACTIVE) {
      throw new BadRequestException('Channel config is INACTIVE');
    }

    const { broker, channel } = channelConfig;

    await this.outboundProducer.publish(message, broker, channel);
  }
}
