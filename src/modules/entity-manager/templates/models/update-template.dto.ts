import { OmitType, PartialType } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { TemplateEntity } from '@/modules/database/templates/entities';

import { TemplateDto } from './template.dto';

export class UpdateTemplateDto extends PartialType(
  OmitType(TemplateDto, [
    'id',
    'companyToken',
    'variables',
    'toEntity',
  ] as const),
) {
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
