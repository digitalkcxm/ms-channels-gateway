import { Type } from 'class-transformer';
import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsMimeType,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import {
  PontalTechRcsContentType,
  PontalTechRcsWebhookAudioContent,
  PontalTechRcsWebhookContactContent,
  PontalTechRcsWebhookDocumentContent,
  PontalTechRcsWebhookFileTextContent,
  PontalTechRcsWebhookImageContent,
  PontalTechRcsWebhookLocationContent,
  PontalTechRcsWebhookRichCardContent,
  PontalTechRcsWebhookTextContent,
  PontalTechRcsWebhookType,
  PontalTechRcsWebhookVideoContent,
  PontalTechWebhookApiRequest,
} from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';

import { MessageStatus } from './enums';
import { BaseMessageDto, OutboundMessageType } from './outbound-base.model';

const RcsOutboundMessageTypes = [
  'audio',
  'text',
  'image',
  'video',
  'document',
  'location',
  'rich-card',
  'carousel',
] as const;
export type RcsMessageType = (typeof RcsOutboundMessageTypes)[number];

const TYPE_TO_STATUS: {
  [key in PontalTechRcsWebhookType]: MessageStatus;
} = {
  audio: MessageStatus.QUEUED,
  carousel: MessageStatus.QUEUED,
  contact: MessageStatus.QUEUED,
  document: MessageStatus.QUEUED,
  image: MessageStatus.QUEUED,
  location: MessageStatus.SENT,
  richCard: MessageStatus.QUEUED,
  text: MessageStatus.SENT,
  video: MessageStatus.QUEUED,
  single: MessageStatus.DELIVERED,
  DELIVERED: MessageStatus.DELIVERED,
  READ: MessageStatus.READ,
  EXCEPTION: MessageStatus.ERROR,
  ERROR: MessageStatus.ERROR,
} as const;

export abstract class BaseRcsMessageContentDto implements BaseMessageDto {
  readonly type: OutboundMessageType = 'rcs';

  @IsIn(RcsOutboundMessageTypes)
  abstract messageType: RcsMessageType;

  public static fromPontalTechRcsWebhookApiRequest(
    model: PontalTechWebhookApiRequest,
  ):
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

  private static PONTAL_TECH_RCS_WEBHOOK_TYPE_MAPPER: {
    [key in PontalTechRcsContentType]: (
      model: PontalTechWebhookApiRequest,
    ) =>
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
    carousel: () => null,
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

  public static extractStatusFromPontalTechRcsWebhookApiRequest(
    webhook: PontalTechWebhookApiRequest,
  ): MessageStatus {
    const mappedStatus = TYPE_TO_STATUS[webhook.type] || MessageStatus.ERROR;

    if (['bloqueado por duplicidade'].includes(webhook.status)) {
      return MessageStatus.ERROR;
    }

    return mappedStatus;
  }
}

export class RcsMessageDocumentContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'document';

  @IsUrl()
  url: string;

  @IsMimeType()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}

export class RcsMessageAudioContentDto extends RcsMessageDocumentContentDto {
  readonly messageType: RcsMessageType = 'audio';
}

export class RcsOutboundMessageCarouselItemDto {
  @IsString()
  @MaxLength(160)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsUrl()
  fileUrl: string;
}

export class RcsMessageCarouselContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'carousel';

  @ValidateNested({ each: true })
  @Type(() => RcsOutboundMessageCarouselItemDto)
  items: RcsOutboundMessageCarouselItemDto[];
}

export class RcsMessageImageContentDto extends RcsMessageDocumentContentDto {
  readonly messageType: RcsMessageType = 'image';
}

export class RcsMessageRichCardContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'rich-card';

  @IsString()
  @MaxLength(160)
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;
}

export class RcsMessageLocationContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'location';

  @IsLatitude()
  latitude: string;

  @IsLongitude()
  longitude?: string;
}

export class RcsMessageTextContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'text';

  @IsString()
  @MaxLength(5000)
  text: string;
}

export class RcsMessageVideoContentDto extends RcsMessageDocumentContentDto {
  readonly messageType: RcsMessageType = 'video';
}

export class RcsMessageDto {
  @ValidateNested()
  @JSONSchema({
    oneOf: [
      dtoToJsonSchema(RcsMessageAudioContentDto),
      dtoToJsonSchema(RcsMessageCarouselContentDto),
      dtoToJsonSchema(RcsMessageDocumentContentDto),
      dtoToJsonSchema(RcsMessageImageContentDto),
      dtoToJsonSchema(RcsMessageLocationContentDto),
      dtoToJsonSchema(RcsMessageRichCardContentDto),
      dtoToJsonSchema(RcsMessageTextContentDto),
      dtoToJsonSchema(RcsMessageVideoContentDto),
    ],
  })
  @Type(() => BaseRcsMessageContentDto, {
    discriminator: {
      property: 'messageType',
      subTypes: [
        { value: RcsMessageAudioContentDto, name: 'audio' },
        { value: RcsMessageCarouselContentDto, name: 'carousel' },
        { value: RcsMessageDocumentContentDto, name: 'document' },
        { value: RcsMessageImageContentDto, name: 'image' },
        { value: RcsMessageLocationContentDto, name: 'location' },
        { value: RcsMessageRichCardContentDto, name: 'rich-card' },
        { value: RcsMessageTextContentDto, name: 'text' },
        { value: RcsMessageVideoContentDto, name: 'video' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  content:
    | RcsMessageAudioContentDto
    | RcsMessageCarouselContentDto
    | RcsMessageImageContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageLocationContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto;
}
