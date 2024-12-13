import { OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { DeepPartial } from 'typeorm';

import { TemplateEntity } from '@/modules/database/templates/entities';

import { TemplateDto } from './template.dto';
import { UpdateTemplateLinkDto } from './update-template-link.dto';

export class UpdateTemplateDto extends PartialType(
  OmitType(TemplateDto, [
    'id',
    'links',
    'companyToken',
    'variables',
    'toEntity',
  ] as const),
) {
  @ValidateNested({ each: true })
  @Type(() => UpdateTemplateLinkDto)
  @IsOptional()
  links?: UpdateTemplateLinkDto[];

  toEntity(
    override?: DeepPartial<TemplateEntity>,
  ): DeepPartial<TemplateEntity> {
    return {
      name: this.name,
      description: this.description,
      externalId: this.externalId,
      channel: this.channel,
      contentType: this.contentType,
      content: this.content,
      links: this.links?.map((link) => link?.toEntity()),
      ...override,
    };
  }
}
