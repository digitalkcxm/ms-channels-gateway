import { IsIn } from 'class-validator';

const OutboundMessageTypes = ['rcs'] as const;
export type OutboundMessageType = (typeof OutboundMessageTypes)[number];

export abstract class BaseOutboundMessageDto {
  @IsIn(OutboundMessageTypes)
  abstract type: OutboundMessageType;
}
