import { BrokerType, ChannelType } from '@/models/enums';

import { RcsMessageDto } from '../rcs/rsc-message.dto';

export class RcsMessageContentParserException extends Error {
  public readonly code: number = 1200;

  constructor(
    public readonly channel: ChannelType,
    public readonly broker: BrokerType,
    public readonly payload: RcsMessageDto,
  ) {
    super('Message can not be parsed');
  }
}
