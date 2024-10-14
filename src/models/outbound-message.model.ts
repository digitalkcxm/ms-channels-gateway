import { InboundEventType } from './enums';
import { RcsMessageModel } from './rsc-message.model';

export type OutboundMessage = {
  channelConfigId: InboundEventType;
  data: RcsMessageModel;
};
