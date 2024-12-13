import { MessageDirection, MessageStatus } from '@/models/enums';

import {
  RcsMessageActionCallbackDto,
  RcsMessageActionContentDto,
} from './rcs/rcs-message-action.dto';
import { RcsMessageDocumentContentDto } from './rcs/rcs-message-document-content.dto';
import {
  RcsMessageAudioContentDto,
  RcsMessageCarouselContentDto,
  RcsMessageImageContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageVideoContentDto,
} from './rcs/rsc-message.dto';

export type RcsInboundMessage = {
  rcsAccountId: string;
  brokerChatId: string;
  brokerMessageId: string;
  direction: MessageDirection;
  status: MessageStatus;
  message?:
    | RcsMessageActionContentDto
    | RcsMessageActionCallbackDto
    | RcsMessageAudioContentDto
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
