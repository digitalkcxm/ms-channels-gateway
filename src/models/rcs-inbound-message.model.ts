import { MessageDirection, MessageStatus } from '@/models/enums';
import {
  RcsMessageCarouselContentDto,
  RcsMessageImageContentDto,
  RcsMessageDocumentContentDto,
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
    | string;
  recipient: string;
};
