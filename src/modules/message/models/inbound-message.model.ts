import { InboundEventType } from './enums';

export type InboundMessage = {
  type: InboundEventType;
  channelConfigId: string;
  data: any;
};
