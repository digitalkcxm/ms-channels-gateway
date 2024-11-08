import { getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
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
  channelConfigId: string;

  @IsUUID()
  referenceChatId: string;

  @IsString({ each: true })
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
  payload: RcsMessageDto;
}
