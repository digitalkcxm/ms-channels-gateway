import { OmitType } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { TemplateLinkEntity } from '@/modules/database/templates/entities';

import { TemplateLinkDto } from './template-link.dto';

export class CreateTemplateLinkDto extends OmitType(TemplateLinkDto, [
  'id',
  'toEntity',
] as const) {
  toEntity(): DeepPartial<TemplateLinkEntity> {
    return {
      templateId: this.templateId,
      template: this.template?.toEntity(),
      referenceId: this.referenceId,
    };
  }
}
