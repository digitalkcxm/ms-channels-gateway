import {
  BrokerType,
  ChannelType,
  MessageDirection,
  MessageStatus,
} from '@/models/enums';

import {
  RcsMessageAudioContentDto,
  RcsMessageCarouselContentDto,
  RcsMessageDocumentContentDto,
  RcsMessageImageContentDto,
  RcsMessageLocationContentDto,
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
    | RcsMessageAudioContentDto
    | RcsMessageCarouselContentDto
    | RcsMessageImageContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageLocationContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto;
  referenceChatId: string;
  channelConfigId?: string;
  channel?: ChannelType;
  broker?: BrokerType;
  messageId: string;
  errorMessage?: string;
  date: Date;
};
