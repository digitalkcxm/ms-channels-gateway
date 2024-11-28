import { OmitType } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { ChannelLinkEntity } from '@/modules/database/channels-gateway/entities/channel-link.entity';

import { ChannelLinkDto } from './channel-link.dto';

export class UpdateChannelLinkDto extends OmitType(ChannelLinkDto, [
  'id',
  'toEntity',
] as const) {
  toEntity(): DeepPartial<ChannelLinkEntity> {
    return {
      referenceId: this.referenceId,
      direction: this.direction,
      channelConfigId: this.channelConfigId,
      channelConfig: this.channelConfig?.toEntity(),
    };
  }
}
