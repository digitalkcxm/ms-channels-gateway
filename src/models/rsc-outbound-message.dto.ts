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
import { BaseOutboundMessageDto, OutboundMessageType } from './outbound-base.model';

const RcsOutboundMessageTypes = [
  'text',
  'image',
  'video',
  'pdf',
  'rich-card',
  'carousel',
] as const;
export type RcsOutboundMessageType = (typeof RcsOutboundMessageTypes)[number];

abstract class BaseRcsOutboundMessageContentDto
  implements BaseOutboundMessageDto
{
  readonly type: OutboundMessageType = 'rcs';

  @IsIn(RcsOutboundMessageTypes)
  abstract messageType: RcsOutboundMessageType;
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

export class RcsOutboundMessageCarouselContentDto extends BaseRcsOutboundMessageContentDto {
  readonly messageType: RcsOutboundMessageType = 'image';

  @ValidateNested({ each: true })
  @Type(() => RcsOutboundMessageCarouselItemDto)
  items: RcsOutboundMessageCarouselItemDto[];
}

export class RcsOutboundMessageImageContentDto extends BaseRcsOutboundMessageContentDto {
  readonly messageType: RcsOutboundMessageType = 'image';

  @IsUrl()
  url: string;
}

export class RcsOutboundMessagePdfContentDto extends BaseRcsOutboundMessageContentDto {
  readonly messageType: RcsOutboundMessageType = 'pdf';

  @IsUrl()
  url: string;
}

export class RcsOutboundMessageRichCardContentDto extends BaseRcsOutboundMessageContentDto {
  readonly messageType: RcsOutboundMessageType = 'rich-card';

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

export class RcsOutboundMessageTextContentDto extends BaseRcsOutboundMessageContentDto {
  readonly messageType: RcsOutboundMessageType = 'text';

  @IsString()
  @MaxLength(5000)
  text: string;
}

export class RcsOutboundMessageVideoContentDto extends BaseRcsOutboundMessageContentDto {
  readonly messageType: RcsOutboundMessageType = 'video';

  @IsUrl()
  url: string;
}

export class RcsOutboundMessageDto {
  @ValidateNested()
  @Type(() => BaseRcsOutboundMessageContentDto, {
    discriminator: {
      property: 'messageType',
      subTypes: [
        { value: RcsOutboundMessageCarouselContentDto, name: 'carousel' },
        { value: RcsOutboundMessageImageContentDto, name: 'image' },
        { value: RcsOutboundMessagePdfContentDto, name: 'pdf' },
        { value: RcsOutboundMessageRichCardContentDto, name: 'rich-card' },
        { value: RcsOutboundMessageTextContentDto, name: 'text' },
        { value: RcsOutboundMessageVideoContentDto, name: 'video' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  content:
    | RcsOutboundMessageCarouselContentDto
    | RcsOutboundMessageImageContentDto
    | RcsOutboundMessagePdfContentDto
    | RcsOutboundMessageRichCardContentDto
    | RcsOutboundMessageTextContentDto
    | RcsOutboundMessageVideoContentDto;
}
