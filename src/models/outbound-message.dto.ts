import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';

import { BaseMessageDto } from './outbound-base.model';
import { RcsMessageDto } from './rsc-message.dto';

export type OutboundMessagePayload = RcsMessageDto;

@JSONSchema({
  $ref: getSchemaPath(OutboundMessageDto),
})
export class OutboundMessageDto {
  @IsUUID()
  @ApiProperty({ type: 'string', format: 'uuid' })
  channelConfigId: string;

  @IsString()
  @ApiProperty()
  referenceChatId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  referenceMessageId?: string;

  @IsString({ each: true })
  @ApiProperty()
  recipients: string[];

  @ValidateNested()
  @JSONSchema({
    oneOf: [dtoToJsonSchema(RcsMessageDto)],
  })
  @Type(() => BaseMessageDto, {
    discriminator: {
      property: 'type',
      subTypes: [{ value: RcsMessageDto, name: 'rcs' }],
    },
    keepDiscriminatorProperty: true,
  })
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(RcsMessageDto) }],
  })
  payload: RcsMessageDto;
}
