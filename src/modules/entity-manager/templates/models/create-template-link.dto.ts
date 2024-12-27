import { OmitType } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { TemplateLinkEntity } from '@/modules/database/templates/entities';

import { TemplateLinkDto } from './template-link.dto';

export class CreateTemplateLinkDto extends OmitType(TemplateLinkDto, [
  'id',
  'templateId',
  'toEntity',
] as const) {
  toEntity(): DeepPartial<TemplateLinkEntity> {
    return {
      template: this.template?.toEntity(),
      referenceId: this.referenceId,
    };
  }
}
