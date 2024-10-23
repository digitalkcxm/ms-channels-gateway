import { Type } from 'class-transformer';
import {
  IsEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  JSONSchema,
  targetConstructorToSchema,
} from 'class-validator-jsonschema';
import { DeepPartial } from 'typeorm';

import { BrokerType, ChannelType } from '@/models/enums';
import { ChannelConfigEntity } from '@/modules/database/channels-gateway/entities/channel-config.entity';
import { ChannelConfigStatus } from '@/modules/database/channels-gateway/entities/enums';

import { ChannelLinkDto } from './channel-link.dto';

@JSONSchema({
  $ref: '#/components/schemas/channel-configs',
})
export class ChannelConfigDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ChannelType)
  channel: ChannelType;

  @IsEnum(BrokerType)
  broker: BrokerType;

  @IsEnum(ChannelConfigStatus)
  status?: ChannelConfigStatus;

  @IsString()
  @IsOptional()
  companyToken: string;

  @ValidateNested({ each: true })
  @Type(() => ChannelLinkDto)
  @JSONSchema({
    type: 'array',
    items: targetConstructorToSchema(ChannelLinkDto),
  })
  @IsOptional()
  links?: ChannelLinkDto[];

  toEntity(
    override?: DeepPartial<ChannelConfigEntity>,
  ): DeepPartial<ChannelConfigEntity> {
    return {
      id: this.id,
      channel: this.channel,
      broker: this.broker,
      status: this.status,
      companyToken: this.companyToken,
      links: this.links?.map((link) => link?.toEntity()),
      ...override,
    };
  }

  static fromEntity(
    entity: DeepPartial<ChannelConfigEntity>,
  ): ChannelConfigDto {
    if (!entity) {
      return null;
    }

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
