import { MessageDirection, MessageStatus } from '@/models/enums';

import { RcsInboundMessage } from './rcs-inbound-message.model';
import {
  RcsMessageCarouselContentDto,
  RcsMessageImageContentDto,
  RcsMessagePdfContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageVideoContentDto,
} from './rsc-message.dto';

export enum SyncEventType {
  MESSAGE = 'message',
  STATUS = 'status',
}

export type SyncModel = {
  eventType: SyncEventType;
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
  chatId: string;
  messageId: string;
  errorMessage?: string;
  date: Date;
};
