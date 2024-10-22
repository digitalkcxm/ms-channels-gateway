import { MessageDirection, MessageStatus } from '@/models/enums';

import {
  RcsMessageCarouselContentDto,
  RcsMessageDocumentContentDto,
  RcsMessageImageContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageVideoContentDto,
} from './rsc-message.dto';

export type RcsInboundMessage = {
  rcsAccountId: string;
  brokerChatId: string;
  brokerMessageId: string;
  direction: MessageDirection;
  status: MessageStatus;
  message?:
    | RcsMessageCarouselContentDto
    | RcsMessageImageContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto
    | null;
  errorMessage?: string;
  recipient: string;
};
