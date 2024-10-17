import { MessageDirection, MessageStatus } from '@/models/enums';

import { RcsInboundMessage } from './rcs-inbound-message.model';
import {
  RcsOutboundMessageCarouselContentDto,
  RcsOutboundMessageDto,
  RcsOutboundMessageImageContentDto,
  RcsOutboundMessagePdfContentDto,
  RcsOutboundMessageRichCardContentDto,
  RcsOutboundMessageTextContentDto,
  RcsOutboundMessageType,
  RcsOutboundMessageVideoContentDto,
} from './rsc-outbound-message.dto';
import { OutboundMessagePayload } from './outbound-message.model';

export enum SyncEventType {
  MESSAGE = 'message',
  STATUS = 'status',
}

export type SyncMessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'file'
  | 'email'
  | 'richCard';

export type SyncTextMessageModel = {
  type: 'text';
  text: string;
};

export type SyncImageMessageModel = {
  type: 'image';
  url: string;
};

export type SyncVideoMessageModel = {
  type: 'video';
  url: string;
};

export type SyncAudioMessageModel = {
  type: 'audio';
  url: string;
};

export type SyncFileMessageModel = {
  type: 'file';
  url: string;
};

export type SyncRichCardMessageModel = {
  type: 'richCard';
  fileUrl: string;
  description?: string;
  title: string;
};

export type SyncCarouselMessageModel = {
  type: 'carousel';
  content: { fileUrl: string; description?: string; title: string }[];
};

export type SyncMessageModel =
  | SyncTextMessageModel
  | SyncImageMessageModel
  | SyncVideoMessageModel
  | SyncAudioMessageModel
  | SyncFileMessageModel
  | SyncRichCardMessageModel
  | SyncCarouselMessageModel;

export type SyncModel = {
  eventType: SyncEventType;
  direction: MessageDirection;
  status: MessageStatus;
  message?: SyncMessageModel;
  chatId: string;
  messageId: string;
  errorMessage?: string;
  date: Date;
};

export class SyncMessageMapper {
  public static fromRcsInboundModel(
    eventType: SyncEventType,
    direction: MessageDirection,
    status: MessageStatus,
    chatId: string,
    messageId: string,
    date: Date,
    inboundMessage: RcsInboundMessage,
    errorMessage?: string,
  ): SyncModel {
    //TODO: Implement this method
    const message: SyncMessageModel = inboundMessage.message || null;

    return {
      eventType,
      direction,
      status,
      message,
      chatId,
      date,
      messageId,
      errorMessage,
    };
  }

  public static fromRcsOutboundMessageDto(
    eventType: SyncEventType,
    direction: MessageDirection,
    status: MessageStatus,
    chatId: string,
    messageId: string,
    date: Date,
    payload: OutboundMessagePayload,
    errorMessage?: string,
  ): SyncModel {
    if (payload as RcsOutboundMessageDto) {
      const message =
        SyncMessageMapper.DTO_TO_SYNC_MODEL_MAPPER[
          payload.content.messageType
        ]?.(payload);

      if (!message) {
        return null;
      }

      return {
        eventType,
        direction,
        status,
        chatId,
        messageId,
        date,
        message,
        errorMessage,
      };
    }

    return null;
  }

  private static DTO_TO_SYNC_MODEL_MAPPER: {
    [key in RcsOutboundMessageType]: (
      dto: RcsOutboundMessageDto,
    ) => SyncMessageModel;
  } = {
    carousel: (dto: RcsOutboundMessageDto) => {
      const content = dto.content as RcsOutboundMessageCarouselContentDto;
      return {
        type: 'carousel',
        content: content.items.map(({ title, description, fileUrl }) => ({
          title,
          description,
          fileUrl,
        })),
      };
    },
    image: (dto: RcsOutboundMessageDto) => {
      const content = dto.content as RcsOutboundMessageImageContentDto;
      return {
        type: 'image',
        url: content.url,
      };
    },
    pdf: (dto: RcsOutboundMessageDto) => {
      const content = dto.content as RcsOutboundMessagePdfContentDto;
      return {
        type: 'file',
        url: content.url,
      };
    },
    text: (dto: RcsOutboundMessageDto) => {
      const content = dto.content as RcsOutboundMessageTextContentDto;
      return {
        type: 'text',
        text: content.text,
      };
    },
    video: (dto: RcsOutboundMessageDto) => {
      const content = dto.content as RcsOutboundMessageVideoContentDto;
      return {
        type: 'video',
        url: content.url,
      };
    },
    'rich-card': (dto: RcsOutboundMessageDto) => {
      const content = dto.content as RcsOutboundMessageRichCardContentDto;
      return {
        type: 'richCard',
        title: content.title,
        description: content.description,
        fileUrl: content.fileUrl,
      };
    },
  };
}
