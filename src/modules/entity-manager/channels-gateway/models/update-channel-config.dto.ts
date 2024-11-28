import { OmitType, PartialType } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { ChannelConfigEntity } from '@/modules/database/channels-gateway/entities/channel-config.entity';

import { ChannelConfigDto } from './channel-config.dto';

export class UpdateChannelConfigDto extends PartialType(
  OmitType(ChannelConfigDto, ['id', 'companyToken', 'toEntity'] as const),
) {
  toEntity(
    override?: DeepPartial<ChannelConfigDto | ChannelConfigEntity>,
  ): DeepPartial<ChannelConfigEntity> {
    return {
      name: this.name,
      description: this.description,
      channel: this.channel,
      broker: this.broker,
      status: this.status,
      links: this.links?.map((link) => link?.toEntity()),
      ...override,
    };
  }
}
