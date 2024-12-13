import { getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmpty, IsString, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { DeepPartial } from 'typeorm';

import { TemplateLinkEntity } from '@/modules/database/templates/entities';

import { TemplateDto } from './template.dto';

@JSONSchema({
  $ref: getSchemaPath(TemplateLinkDto),
})
export class TemplateLinkDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsString()
  templateId: string;

  @Type(() => TemplateDto)
  template?: TemplateDto;

  @IsString()
  referenceId: string;

  toEntity(): DeepPartial<TemplateLinkEntity> {
    return {
      id: this.id,
      templateId: this.templateId,
      template: this.template?.toEntity(),
      referenceId: this.referenceId,
    };
  }

  static fromEntity(entity: DeepPartial<TemplateLinkEntity>): TemplateLinkDto {
    if (!entity) {
      return null;
    }

    const dto = new TemplateLinkDto();

    dto.id = entity?.id;
    dto.templateId = entity?.templateId;
    dto.template = TemplateDto.fromEntity(entity?.template);
    dto.referenceId = entity?.referenceId;

    return dto;
  }
}
