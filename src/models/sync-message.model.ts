import {
  BrokerType,
  ChannelType,
  MessageDirection,
  MessageStatus,
} from '@/models/enums';

import {
  RcsMessageActionCallbackDto,
  RcsMessageActionContentDto,
} from './rcs/rcs-message-action.dto';
import { RcsMessageDocumentContentDto } from './rcs/rcs-message-document-content.dto';
import {
  RcsMessageAudioContentDto,
  RcsMessageCarouselContentDto,
  RcsMessageImageContentDto,
  RcsMessageLocationContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageVideoContentDto,
} from './rcs/rsc-message.dto';

export enum SyncEventType {
  MESSAGE = 'message',
  STATUS = 'status',
}

export type SyncModel = {
  eventType: SyncEventType;
  direction: MessageDirection;
  status: MessageStatus;
  message?:
    | RcsMessageActionContentDto
    | RcsMessageActionCallbackDto
    | RcsMessageAudioContentDto
    | RcsMessageCarouselContentDto
    | RcsMessageImageContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageLocationContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto;
  referenceChatId: string;
  referenceMessageId?: string;
  contact: string;
  channelConfigId?: string;
  channel?: ChannelType;
  broker?: BrokerType;
  messageId: string;
  errorMessage?: string;
  date: Date;
};
