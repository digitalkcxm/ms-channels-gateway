import { BrokerType } from '../enums';

export class MessageNotReadyException extends Error {
  public readonly code: number = 1500;

  constructor(
    public readonly brokerChatId: string,
    public readonly broker: BrokerType,
  ) {
    super(
      `Message not ready for broker ${broker} with brokerChatId ${brokerChatId}`,
    );
  }
}
