import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';

import { BaseMessageDto } from './outbound-base.model';
import { RcsMessageDto } from './rsc-message.dto';

export type OutboundMessagePayload = RcsMessageDto;

export class OutboundMessageDto {
  @IsUUID()
  channelConfigId: string;

  @IsUUID()
  referenceChatId: string;

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
