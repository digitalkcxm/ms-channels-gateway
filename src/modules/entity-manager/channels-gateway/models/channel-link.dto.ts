import { getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmpty, IsEnum, IsString, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { DeepPartial } from 'typeorm';

import { ChannelLinkEntity } from '@/modules/database/channels-gateway/entities/channel-link.entity';
import { ChannelDirection } from '@/modules/database/channels-gateway/entities/enums';

import { ChannelConfigDto } from './channel-config.dto';

@JSONSchema({
  $ref: getSchemaPath(ChannelLinkDto),
})
export class ChannelLinkDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsString()
  referenceId: string;

  @IsEnum(ChannelDirection)
  direction: ChannelDirection;

  @IsUUID()
  channelConfigId: string;

  @Type(() => ChannelConfigDto)
  channelConfig?: ChannelConfigDto;

  toEntity(): DeepPartial<ChannelLinkEntity> {
    return {
      id: this.id,
      referenceId: this.referenceId,
      direction: this.direction,
      channelConfigId: this.channelConfigId,
      channelConfig: this.channelConfig?.toEntity(),
    };
  }

  static fromEntity(entity: DeepPartial<ChannelLinkEntity>): ChannelLinkDto {
    if (!entity) {
      return null;
    }

    const dto = new ChannelLinkDto();

    dto.id = entity?.id;
    dto.referenceId = entity?.referenceId;
    dto.direction = entity?.direction;
    dto.channelConfigId = entity?.channelConfigId;
    dto.channelConfig = entity.channelConfig
      ? ChannelConfigDto.fromEntity(entity.channelConfig)
      : undefined;

    return dto;
  }
}
