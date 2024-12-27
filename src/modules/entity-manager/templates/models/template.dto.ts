import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { DeepPartial } from 'typeorm';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { ChannelType } from '@/models/enums';
import {
  TemplateActionItem,
  TemplateCarouselContent,
  TemplateCarouselItem,
  TemplateEntity,
  TemplateRichCardContent,
  TemplateTextContent,
} from '@/modules/database/templates/entities';
import { TemplateContentType } from '@/modules/database/templates/entities/enums';

import { BaseTemplateContentDto } from './contents/base-template-content.dto';
import { TemplateActionItemDto } from './contents/template-action-item.dto';
import { TemplateCarouselContentDto } from './contents/template-carousel-content.dto';
import { TemplateRichCardContentDto } from './contents/template-rich-card-content.dto';
import { TemplateTextContentDto } from './contents/template-text-content.dto';
import { TemplateLinkDto } from './template-link.dto';

@JSONSchema({
  $ref: getSchemaPath(TemplateDto),
})
export class TemplateDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  companyToken: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsEnum(ChannelType)
  channel: ChannelType;

  @IsEnum(TemplateContentType)
  contentType: TemplateContentType;

  @ValidateNested()
  @JSONSchema({
    oneOf: [
      dtoToJsonSchema(TemplateCarouselContentDto),
      dtoToJsonSchema(TemplateRichCardContentDto),
      dtoToJsonSchema(TemplateTextContentDto),
    ],
  })
  @Type(() => BaseTemplateContentDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        {
          value: TemplateCarouselContentDto,
          name: TemplateContentType.CAROUSEL,
        },
        {
          value: TemplateRichCardContentDto,
          name: TemplateContentType.RICH_CARD,
        },
        { value: TemplateTextContentDto, name: TemplateContentType.TEXT },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  @ApiProperty()
  content?:
    | TemplateCarouselContentDto
    | TemplateRichCardContentDto
    | TemplateTextContentDto;

  @IsArray({ each: true })
  @IsOptional()
  @ApiProperty()
  variables?: string[];

  @ValidateNested({ each: true })
  @Type(() => TemplateLinkDto)
  @IsOptional()
  links?: TemplateLinkDto[];

  toEntity(
    override?: DeepPartial<TemplateEntity>,
  ): DeepPartial<TemplateEntity> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      companyToken: this.companyToken,
      externalId: this.externalId,
      channel: this.channel,
      contentType: this.contentType,
      content: this.content,
      links: this.links?.map((link) => link?.toEntity()),
      ...override,
    };
  }

  static fromEntity(entity: DeepPartial<TemplateEntity>): TemplateDto {
    if (!entity) {
      return null;
    }

    const dto = new TemplateDto();

    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.companyToken = entity.companyToken;
    dto.externalId = entity.externalId;
    dto.channel = entity.channel;
    dto.contentType = entity.contentType;
    dto.content = TemplateDto.fromEntityContent(entity.content);
    dto.variables = entity.variables;
    dto.links = entity?.links?.length
      ? entity.links.map(TemplateLinkDto.fromEntity)
      : [];

    return dto;
  }

  static fromEntityContent(
    content: DeepPartial<
      TemplateTextContent | TemplateRichCardContent | TemplateCarouselContent
    >,
  ):
    | TemplateTextContentDto
    | TemplateRichCardContentDto
    | TemplateCarouselContentDto {
    if (!content) {
      return null;
    }

    switch (content.type) {
      case TemplateContentType.TEXT:
        return {
          type: content.type,
          text: content.text,
        } as TemplateTextContent;
      case TemplateContentType.RICH_CARD:
        return {
          type: content.type,
          actions: content.actions?.map<TemplateActionItemDto>(
            (action: TemplateActionItem) => ({
              type: action.type,
              text: action.text,
              value: action.value,
            }),
          ),
          description: content.description,
          imageUrl: content.imageUrl,
          title: content.title,
        } as TemplateRichCardContentDto;
      case TemplateContentType.CAROUSEL:
        return {
          type: content.type,
          items: content.items?.map((item: TemplateCarouselItem) => ({
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            actions: item.actions?.map<TemplateActionItemDto>(
              (action: TemplateActionItem) => ({
                type: action.type,
                text: action.text,
                value: action.value,
              }),
            ),
          })),
        } as TemplateCarouselContentDto;
    }
  }
}
