import { Type } from 'class-transformer';
import { IsArray, IsEmpty, IsEnum, IsString, IsUUID } from 'class-validator';
import { DeepPartial } from 'typeorm';

import { ChannelConfigEntity } from '@/modules/database/entities/channel-config.entity';
import {
  BrokerType,
  ChannelConfigStatus,
  ChannelType,
} from '@/modules/database/entities/enums';

import { ChannelLinkDto } from './channel-link.dto';

export class ChannelConfigDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsEnum(ChannelType)
  channel: ChannelType;

  @IsEnum(BrokerType)
  broker: BrokerType;

  @IsEnum(ChannelConfigStatus)
  status?: ChannelConfigStatus;

  @IsString()
  @IsEmpty()
  companyToken: string;

  @IsArray()
  @Type(() => ChannelLinkDto)
  links?: ChannelLinkDto[];

  toEntity(
    override?: DeepPartial<ChannelConfigDto | ChannelConfigEntity>,
  ): DeepPartial<ChannelConfigEntity> {
    return {
      id: this.id,
      channel: this.channel,
      broker: this.broker,
      status: this.status,
      companyToken: this.companyToken,
      links: this.links?.map((link) => link.toEntity()),
      ...override,
    };
  }

  static fromEntity(
    entity: DeepPartial<ChannelConfigEntity>,
  ): ChannelConfigDto {
    const dto = new ChannelConfigDto();

    dto.id = entity?.id;
    dto.companyToken = entity?.companyToken;
    dto.channel = entity?.channel;
    dto.broker = entity?.broker;
    dto.status = entity?.status;
    dto.links = entity?.links?.length
      ? entity.links.map(ChannelLinkDto.fromEntity)
      : [];

    return dto;
  }
}
