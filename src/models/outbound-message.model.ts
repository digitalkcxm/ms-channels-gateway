import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { RcsOutboundMessageDto } from './rsc-outbound-message.dto';
import { BaseOutboundMessageDto } from './outbound-base.model';

export type OutboundMessagePayload = RcsOutboundMessageDto;

export class OutboundMessageDto {
  @IsUUID()
  channelConfigId: string;

  @IsUUID()
  chatId: string;

  @IsString({ each: true })
  recipients: string[];

  @ValidateNested()
  @Type(() => BaseOutboundMessageDto, {
    discriminator: {
      property: 'type',
      subTypes: [{ value: RcsOutboundMessageDto, name: 'rcs' }],
    },
    keepDiscriminatorProperty: true,
  })
  payload: OutboundMessagePayload;
}
