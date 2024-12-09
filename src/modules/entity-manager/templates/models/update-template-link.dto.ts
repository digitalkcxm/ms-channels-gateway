import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { DeepPartial } from 'typeorm';

import { TemplateLinkEntity } from '@/modules/database/templates/entities';

import { TemplateLinkDto } from './template-link.dto';

export class UpdateTemplateLinkDto extends OmitType(TemplateLinkDto, [
  'id',
  'toEntity',
] as const) {
  @IsUUID()
  @IsOptional()
  id: string;

  toEntity(): DeepPartial<TemplateLinkEntity> {
    return {
      id: this.id,
      templateId: this.templateId,
      template: this.template?.toEntity(),
      referenceId: this.referenceId,
    };
  }
}
