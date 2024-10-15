import { MessageDirection, MessageStatus } from '@/models/enums';

import { RcsInboundMessage } from './rcs-inbound-message.model';
import {
  RcsMessageAllModels,
  RcsMessageModel,
  RcsMessageType,
} from './rsc-message.model';

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

export type SyncMessageModel =
  | SyncTextMessageModel
  | SyncImageMessageModel
  | SyncVideoMessageModel
  | SyncAudioMessageModel
  | SyncFileMessageModel;

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
  public static fromRcsMessageModel(
    eventType: SyncEventType,
    direction: MessageDirection,
    status: MessageStatus,
    chatId: string,
    messageId: string,
    date: Date,
    messageModel: RcsMessageModel,
    errorMessage?: string,
  ): SyncModel {
    const message: SyncMessageModel =
      SyncMessageMapper.parser[messageModel.messageType]?.(messageModel);

    if (!message) {
      throw new Error('Message type not supported');
    }

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
    const message: SyncMessageModel = {
      type: 'text',
      text: inboundMessage.message,
    };

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

  private static parser: {
    [type in RcsMessageType]: (
      inboundMessage: RcsMessageAllModels,
    ) => SyncMessageModel | null;
  } = {
    text: (inboundMessage: RcsMessageAllModels) => {
      if (inboundMessage.messageType === 'text' && !inboundMessage.content.text)
        return null;

      return {
        type: 'text',
        text:
          inboundMessage.messageType === 'text' && inboundMessage.content.text,
      };
    },
    image: (inboundMessage: RcsMessageAllModels) => {
      if (inboundMessage.messageType === 'image' && !inboundMessage.content.url)
        return null;

      return {
        type: 'image',
        url:
          inboundMessage.messageType === 'image' && inboundMessage.content.url,
      };
    },
    video: (inboundMessage: RcsMessageAllModels) => {
      if (inboundMessage.messageType === 'video' && !inboundMessage.content.url)
        return null;

      return {
        type: 'video',
        url:
          inboundMessage.messageType === 'video' && inboundMessage.content.url,
      };
    },
    pdf: (inboundMessage: RcsMessageAllModels) => {
      if (inboundMessage.messageType === 'pdf' && !inboundMessage.content.url)
        return null;

      return {
        type: 'file',
        url: inboundMessage.messageType === 'pdf' && inboundMessage.content.url,
      };
    },
    richCard: () => null,
    carousel: () => null,
  };
}
