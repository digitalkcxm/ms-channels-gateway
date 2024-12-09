import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { DeepPartial } from 'typeorm';

import { TemplateEntity } from '@/modules/database/templates/entities';

import { CreateTemplateLinkDto } from './create-template-link.dto';
import { TemplateDto } from './template.dto';

export class CreateTemplateDto extends OmitType(TemplateDto, [
  'id',
  'links',
  'companyToken',
  'variables',
  'toEntity',
] as const) {
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateLinkDto)
  @IsOptional()
  links?: CreateTemplateLinkDto[];

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
