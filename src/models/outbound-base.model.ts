import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const OutboundMessageTypes = ['rcs'] as const;
export type OutboundMessageType = (typeof OutboundMessageTypes)[number];

export abstract class BaseMessageDto {
  @IsIn(OutboundMessageTypes)
  @ApiProperty()
  abstract type: OutboundMessageType;
}
