import { BrokerType, ChannelType } from './enums';

export type InboundMessage = {
  broker: BrokerType;
  channel: ChannelType;
  payload: any;
};
