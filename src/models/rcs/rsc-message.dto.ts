import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { PontalTechRcsWebhookType } from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';

import { BaseRcsMessageContentDto } from './base-rcs-message-content.dto.js';
import {
  BaseRcsActionItemDto,
  RcsActionItemCallDto,
  RcsActionItemOpenUrlDto,
  RcsActionItemReplyDto,
  RcsMessageActionContentDto,
} from './rcs-messag-action.dto.js';
import { RcsMessageDocumentContentDto } from './rcs-message-document-content.dto';
import { RcsMessageType } from './rcs-nessage-type.js';

import { MessageStatus } from '../enums';

export const TYPE_TO_STATUS: {
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
  suggestion: MessageStatus.READ,
  suggestionResponse: MessageStatus.READ,
  DELIVERED: MessageStatus.DELIVERED,
  READ: MessageStatus.READ,
  EXCEPTION: MessageStatus.ERROR,
  ERROR: MessageStatus.ERROR,
} as const;

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

  @IsOptional()
  @ValidateNested()
  @JSONSchema({
    oneOf: [
      dtoToJsonSchema(RcsActionItemOpenUrlDto),
      dtoToJsonSchema(RcsActionItemCallDto),
      dtoToJsonSchema(RcsActionItemReplyDto),
    ],
  })
  @Type(() => BaseRcsActionItemDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: RcsActionItemOpenUrlDto, name: 'openUrl' },
        { value: RcsActionItemCallDto, name: 'call' },
        { value: RcsActionItemReplyDto, name: 'reply' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  suggestions?: (
    | RcsActionItemOpenUrlDto
    | RcsActionItemCallDto
    | RcsActionItemReplyDto
  )[];
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

  @IsOptional()
  @ValidateNested()
  @JSONSchema({
    oneOf: [
      dtoToJsonSchema(RcsActionItemOpenUrlDto),
      dtoToJsonSchema(RcsActionItemCallDto),
      dtoToJsonSchema(RcsActionItemReplyDto),
    ],
  })
  @Type(() => BaseRcsActionItemDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: RcsActionItemOpenUrlDto, name: 'openUrl' },
        { value: RcsActionItemCallDto, name: 'call' },
        { value: RcsActionItemReplyDto, name: 'reply' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  suggestions?: (
    | RcsActionItemOpenUrlDto
    | RcsActionItemCallDto
    | RcsActionItemReplyDto
  )[];
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
      dtoToJsonSchema(RcsMessageActionContentDto),
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
        { value: RcsMessageActionContentDto, name: 'actions' },
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
  @ApiProperty()
  content:
    | RcsMessageAudioContentDto
    | RcsMessageCarouselContentDto
    | RcsMessageImageContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageLocationContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto
    | RcsMessageActionContentDto;
}
