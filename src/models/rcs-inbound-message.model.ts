import {
  MessageDirection,
  MessageStatus,
} from '@/modules/database/rcs/entities/enums';

export type RcsInboundMessage = {
  rcsAccountId: string;
  brokerChatId: string;
  brokerMessageId: string;
  direction: MessageDirection;
  status: MessageStatus;
  message: any;
};
