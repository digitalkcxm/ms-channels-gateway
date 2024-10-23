import { Type } from 'class-transformer';
import {
  IsIn,
  IsMimeType,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  PontalTechRcsContentType,
  PontalTechRcsWebhookContactContent,
  PontalTechRcsWebhookDocumentContent,
  PontalTechRcsWebhookFileTextContent,
  PontalTechRcsWebhookImageContent,
  PontalTechRcsWebhookRichCardContent,
  PontalTechRcsWebhookTextContent,
  PontalTechRcsWebhookVideoContent,
  PontalTechWebhookApiRequest,
} from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';

import { BaseMessageDto, OutboundMessageType } from './outbound-base.model';

const RcsOutboundMessageTypes = [
  'text',
  'image',
  'video',
  'document',
  'rich-card',
  'carousel',
] as const;
export type RcsMessageType = (typeof RcsOutboundMessageTypes)[number];

export abstract class BaseRcsMessageContentDto implements BaseMessageDto {
  readonly type: OutboundMessageType = 'rcs';

  @IsIn(RcsOutboundMessageTypes)
  abstract messageType: RcsMessageType;

  public static fromPontalTechRcsWebhookApiRequest(
    model: PontalTechWebhookApiRequest,
  ):
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
      | RcsMessageCarouselContentDto
      | RcsMessageDocumentContentDto
      | RcsMessageImageContentDto
      | RcsMessageRichCardContentDto
      | RcsMessageTextContentDto
      | RcsMessageVideoContentDto;
  } = {
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
  readonly messageType: RcsMessageType = 'image';

  @ValidateNested({ each: true })
  @Type(() => RcsOutboundMessageCarouselItemDto)
  items: RcsOutboundMessageCarouselItemDto[];
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
  @Type(() => BaseRcsMessageContentDto, {
    discriminator: {
      property: 'messageType',
      subTypes: [
        { value: RcsMessageCarouselContentDto, name: 'carousel' },
        { value: RcsMessageImageContentDto, name: 'image' },
        { value: RcsMessageDocumentContentDto, name: 'document' },
        { value: RcsMessageRichCardContentDto, name: 'rich-card' },
        { value: RcsMessageTextContentDto, name: 'text' },
        { value: RcsMessageVideoContentDto, name: 'video' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  content:
    | RcsMessageCarouselContentDto
    | RcsMessageImageContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto;
}
