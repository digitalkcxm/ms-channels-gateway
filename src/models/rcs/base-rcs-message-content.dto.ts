import { IsIn } from 'class-validator';

import {
  PontalTechRcsContentType,
  PontalTechRcsWebhookAudioContent,
  PontalTechRcsWebhookCarouselContent,
  PontalTechRcsWebhookContactContent,
  PontalTechRcsWebhookDocumentContent,
  PontalTechRcsWebhookFileTextContent,
  PontalTechRcsWebhookImageContent,
  PontalTechRcsWebhookLocationContent,
  PontalTechRcsWebhookRichCardContent,
  PontalTechRcsWebhookSuggestionResponseContent,
  PontalTechRcsWebhookSuggestionResponseType,
  PontalTechRcsWebhookTextContent,
  PontalTechRcsWebhookVideoContent,
  PontalTechWebhookApiRequest,
} from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';

import { RcsMessageActionType } from './rcs-message-action-type';
import {
  RcsMessageActionCallbackDto,
  RcsMessageActionContentDto,
} from './rcs-message-action.dto';
import { RcsMessageDocumentContentDto } from './rcs-message-document-content.dto';
import { RcsMessageType, RcsMessageTypes } from './rcs-message-type';
import {
  RcsMessageAudioContentDto,
  RcsMessageCarouselContentDto,
  RcsMessageImageContentDto,
  RcsMessageLocationContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageVideoContentDto,
  TYPE_TO_STATUS,
} from './rsc-message.dto';

import { MessageStatus } from '../enums';
import { BaseMessageDto, OutboundMessageType } from '../outbound-base.model';

export abstract class BaseRcsMessageContentDto implements BaseMessageDto {
  readonly type: OutboundMessageType = 'rcs';

  @IsIn(RcsMessageTypes)
  abstract messageType: RcsMessageType;

  public static fromPontalTechRcsWebhookApiRequest(
    model: PontalTechWebhookApiRequest,
  ):
    | RcsMessageActionContentDto
    | RcsMessageActionCallbackDto
    | RcsMessageAudioContentDto
    | RcsMessageCarouselContentDto
    | RcsMessageImageContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto
    | null {
    if (
      ['outbound'].includes(model.direction) ||
      ['DELIVERED', 'READ'].includes(model.type) ||
      ['bloqueado por duplicidade'].includes(model.status) ||
      ['EXCEPTION', 'ERROR'].includes(model.type)
    ) {
      return null;
    }

    const message =
      BaseRcsMessageContentDto.PONTAL_TECH_RCS_WEBHOOK_TYPE_MAPPER[
        model.type
      ]?.(model);

    return message || model.message;
  }

  public static extractErrorFromPontalTechRcsWebhookApiRequest(
    model: PontalTechWebhookApiRequest,
  ): string | null {
    if (['bloqueado por duplicidade'].includes(model.status)) {
      return model.status;
    }

    if (['EXCEPTION', 'ERROR'].includes(model.type)) {
      return model.message as string;
    }

    return null;
  }

  public static extractStatusFromPontalTechRcsWebhookApiRequest(
    webhook: PontalTechWebhookApiRequest,
  ): MessageStatus {
    const mappedStatus = TYPE_TO_STATUS[webhook.type] || MessageStatus.ERROR;

    if (['bloqueado por duplicidade'].includes(webhook.status)) {
      return MessageStatus.ERROR;
    }

    return mappedStatus;
  }

  public static convertSuggestionResponseTypeToActionType(
    suggestionResponseType: PontalTechRcsWebhookSuggestionResponseType,
  ): RcsMessageActionType {
    switch (suggestionResponseType) {
      case 'REPLY':
        return 'reply';
      case 'OPENURL':
        return 'openUrl';
      case 'CALL':
        return 'call';
      default:
        return 'reply';
    }
  }

  private static PONTAL_TECH_RCS_WEBHOOK_TYPE_MAPPER: {
    [key in PontalTechRcsContentType]: (
      model: PontalTechWebhookApiRequest,
    ) =>
      | RcsMessageActionContentDto
      | RcsMessageActionCallbackDto
      | RcsMessageAudioContentDto
      | RcsMessageCarouselContentDto
      | RcsMessageDocumentContentDto
      | RcsMessageImageContentDto
      | RcsMessageLocationContentDto
      | RcsMessageRichCardContentDto
      | RcsMessageTextContentDto
      | RcsMessageVideoContentDto;
  } = {
    audio: (model: PontalTechWebhookApiRequest): RcsMessageAudioContentDto => {
      const content = model.message as PontalTechRcsWebhookAudioContent;
      return {
        type: 'rcs',
        messageType: 'audio',
        url: content.audio.fileUri,
        mimeType: content.audio.mimeType,
        fileName:
          content.audio.fileName || content.audio.fileUri.split('/').pop(),
      };
    },
    carousel: (
      model: PontalTechWebhookApiRequest,
    ): RcsMessageCarouselContentDto => {
      const content = model.message as PontalTechRcsWebhookCarouselContent;
      return {
        type: 'rcs',
        messageType: 'carousel',
        items: content.message.items.map((item) => ({
          title: item.title,
          description: item.description,
          fileUrl: item.fileUrl,
          suggestions: item.suggestions?.map((suggestion) => ({
            type: suggestion.type,
            title: suggestion.title,
            value: suggestion.value,
          })),
        })),
      };
    },
    contact: (
      model: PontalTechWebhookApiRequest,
    ): RcsMessageDocumentContentDto => {
      const content = model.message as PontalTechRcsWebhookContactContent;
      return {
        type: 'rcs',
        messageType: 'document',
        url: content.contact.fileUri,
        mimeType: content.contact.mimeType,
        fileName:
          content.contact.fileName || content.contact.fileUri.split('/').pop(),
      };
    },
    document: (
      model: PontalTechWebhookApiRequest,
    ): RcsMessageDocumentContentDto => {
      const content = model.message as PontalTechRcsWebhookDocumentContent;
      return {
        type: 'rcs',
        messageType: 'document',
        url: content.document.fileUri,
        mimeType: content.document.mimeType,
        fileName:
          content.document.fileName ||
          content.document.fileUri.split('/').pop(),
      };
    },
    image: (model: PontalTechWebhookApiRequest): RcsMessageImageContentDto => {
      const content = model.message as PontalTechRcsWebhookImageContent;
      return {
        type: 'rcs',
        messageType: 'image',
        url: content.image.fileUri,
        mimeType: content.image.mimeType,
        fileName:
          content.image.fileName || content.image.fileUri.split('/').pop(),
      };
    },
    location: (
      model: PontalTechWebhookApiRequest,
    ): RcsMessageLocationContentDto => {
      const content = model.message as PontalTechRcsWebhookLocationContent;
      return {
        type: 'rcs',
        messageType: 'location',
        latitude: content.location.latitude,
        longitude: content.location.longitude,
      };
    },
    richCard: (model: PontalTechWebhookApiRequest) => {
      const content = model.message as PontalTechRcsWebhookRichCardContent;
      return {
        type: 'rcs',
        messageType: 'rich-card',
        title: content.message.title,
        description: content.message.description,
        fileUrl: content.message.fileUrl,
        suggestions: content.message.suggestions?.map((suggestion) => ({
          type: suggestion.type,
          title: suggestion.title,
          value: suggestion.value,
        })),
      };
    },
    suggestion: (
      model: PontalTechWebhookApiRequest,
    ): RcsMessageActionContentDto => {
      const content =
        model.message as PontalTechRcsWebhookSuggestionResponseContent;

      return {
        type: 'rcs',
        messageType: 'actions',
        title: content?.suggestionResponse?.text,
        actions: [
          {
            type: BaseRcsMessageContentDto.convertSuggestionResponseTypeToActionType(
              content?.suggestionResponse.type,
            ),
            title: content?.suggestionResponse.text,
            value: content?.suggestionResponse.postbackData,
          },
        ],
      };
    },
    suggestionResponse: (
      model: PontalTechWebhookApiRequest,
    ): RcsMessageActionCallbackDto => {
      const content =
        model.message as PontalTechRcsWebhookSuggestionResponseContent;

      return {
        type: 'rcs',
        messageType: 'action-callback',
        callback: {
          type: BaseRcsMessageContentDto.convertSuggestionResponseTypeToActionType(
            content?.suggestionResponse.type,
          ),
          title: content?.suggestionResponse.text,
          value: content?.suggestionResponse.postbackData,
        },
      };
    },
    text: (
      model: PontalTechWebhookApiRequest,
    ): RcsMessageTextContentDto | RcsMessageDocumentContentDto => {
      const fileTextContent =
        model.message as PontalTechRcsWebhookFileTextContent;

      if (fileTextContent?.contentType !== model.type) {
        return {
          type: 'rcs',
          messageType: 'document',
          url: fileTextContent.text.fileUri,
          mimeType: fileTextContent.text.mimeType,
          fileName:
            fileTextContent.text.fileName ||
            fileTextContent.text.fileUri.split('/').pop(),
        };
      }

      const content = model.message as PontalTechRcsWebhookTextContent;
      return {
        type: 'rcs',
        messageType: 'text',
        text: content.text,
      };
    },
    video: (model: PontalTechWebhookApiRequest): RcsMessageVideoContentDto => {
      const content = model.message as PontalTechRcsWebhookVideoContent;
      return {
        type: 'rcs',
        messageType: 'video',
        url: content.video.fileUri,
        mimeType: content.video.mimeType,
        fileName:
          content.video.fileName || content.video.fileUri.split('/').pop(),
      };
    },
  };
}
