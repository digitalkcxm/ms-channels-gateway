import { InboundEventType } from './enums';
import { RcsInboundMessage } from './rcs-inbound-message.model';

export type InboundMessage = {
  type: InboundEventType;
  data: RcsInboundMessage;
};
