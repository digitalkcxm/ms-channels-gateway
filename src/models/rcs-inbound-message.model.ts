import { MessageDirection, MessageStatus } from '@/models/enums';
import {
  RcsMessageCarouselContentDto,
  RcsMessageImageContentDto,
  RcsMessagePdfContentDto,
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
    | RcsMessagePdfContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto
    | string;
  recipient: string;
};
