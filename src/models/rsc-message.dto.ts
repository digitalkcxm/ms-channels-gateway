import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BaseMessageDto, OutboundMessageType } from './outbound-base.model';
import {
  PontalTechRcsContentType,
  PontalTechRcsWebhookImageContent,
  PontalTechRcsWebhookTextContent,
  PontalTechRcsWebhookVideoContent,
  PontalTechWebhookApiRequest,
} from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';

const RcsOutboundMessageTypes = [
  'text',
  'image',
  'video',
  'pdf',
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
    | RcsMessagePdfContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto
    | string {
    if (['DELIVERED', 'READ'].includes(model.type)) {
      return null;
    }

    if (['bloqueado por duplicidade'].includes(model.status)) {
      return model.status;
    }

    if (['EXCEPTION', 'ERROR'].includes(model.type)) {
      return model.message as string;
    }

    const message =
      BaseRcsMessageContentDto.PONTAL_TECH_RCS_WEBHOOK_TYPE_MAPPER[
        model.type
      ]?.(model);

    return message;
  }

  private static PONTAL_TECH_RCS_WEBHOOK_TYPE_MAPPER: {
    [key in PontalTechRcsContentType]: (
      model: PontalTechWebhookApiRequest,
    ) =>
      | RcsMessageCarouselContentDto
      | RcsMessageImageContentDto
      | RcsMessagePdfContentDto
      | RcsMessageRichCardContentDto
      | RcsMessageTextContentDto
      | RcsMessageVideoContentDto;
  } = {
    image: (model: PontalTechWebhookApiRequest): RcsMessageImageContentDto => {
      const content = model.message as PontalTechRcsWebhookImageContent;
      return {
        type: 'rcs',
        messageType: 'image',
        url: content.url,
      };
    },
    text: (model: PontalTechWebhookApiRequest): RcsMessageTextContentDto => {
      const content = model.message as PontalTechRcsWebhookTextContent;
      return {
        type: 'rcs',
        messageType: 'text',
        text: content.text,
      };
    },
    carousel: () => null,
    pdf: () => null,
    richCard: () => null,
    video: (model: PontalTechWebhookApiRequest): RcsMessageVideoContentDto => {
      const content = model.message as PontalTechRcsWebhookVideoContent;
      return {
        type: 'rcs',
        messageType: 'video',
        url: content.image.fileUri,
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

export class RcsMessageImageContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'image';

  @IsUrl()
  url: string;
}

export class RcsMessagePdfContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'pdf';

  @IsUrl()
  url: string;
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

export class RcsMessageVideoContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'video';

  @IsUrl()
  url: string;
}

export class RcsMessageDto {
  @ValidateNested()
  @Type(() => BaseRcsMessageContentDto, {
    discriminator: {
      property: 'messageType',
      subTypes: [
        { value: RcsMessageCarouselContentDto, name: 'carousel' },
        { value: RcsMessageImageContentDto, name: 'image' },
        { value: RcsMessagePdfContentDto, name: 'pdf' },
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
    | RcsMessagePdfContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto;
}
