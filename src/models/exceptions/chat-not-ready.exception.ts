import { BrokerType } from '../enums';

export class ChatNotReadyException extends Error {
  public readonly code: number = 1000;

  constructor(
    public readonly brokerChatId: string,
    public readonly broker: BrokerType,
  ) {
    super(
      `Chat not ready for broker ${broker} with brokerChatId ${brokerChatId}`,
    );
  }
}
