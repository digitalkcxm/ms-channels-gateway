import { BrokerType } from '../enums';

export class RcsAccountNotFoundException extends Error {
  public readonly code: number = 1000;

  constructor(
    public readonly channelConfigId: string,
    public readonly broker: BrokerType,
  ) {
    super('RCS Account not found');
  }
}
