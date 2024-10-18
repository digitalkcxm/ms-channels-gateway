import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RcsMessageDto } from './rsc-message.dto';
import { BaseMessageDto } from './outbound-base.model';

export type OutboundMessagePayload = RcsMessageDto;

export class OutboundMessageDto {
  @IsUUID()
  channelConfigId: string;

  @IsUUID()
  chatId: string;

  @IsString({ each: true })
  recipients: string[];

  @ValidateNested()
  @Type(() => BaseMessageDto, {
    discriminator: {
      property: 'type',
      subTypes: [{ value: RcsMessageDto, name: 'rcs' }],
    },
    keepDiscriminatorProperty: true,
  })
  payload: OutboundMessagePayload;
}
