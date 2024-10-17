import { BrokerType } from '../enums';

export class ChatNotFoundException extends Error {
  public readonly code: number = 1000;

  constructor(
    public readonly brokerChatId: string,
    public readonly broker: BrokerType,
  ) {
    super(`Chat not found for broker ${broker} with id ${brokerChatId}`);
  }
}
