import { BrokerType, ChannelType } from '@/models/enums';

import { RcsMessageDto } from '../rsc-message.dto';

export class MessageContentNotSupportedException extends Error {
  public readonly code: number = 1210;

  constructor(
    public readonly channel: ChannelType,
    public readonly broker: BrokerType,
    public readonly payload: RcsMessageDto,
  ) {
    super('Message can not be parsed');
  }
}
