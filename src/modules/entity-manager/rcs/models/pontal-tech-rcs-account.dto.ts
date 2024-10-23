import { IsOptional, IsString, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { DeepPartial } from 'typeorm';

import { PontalTechRcsAccountEntity } from '@/modules/database/rcs/entities/pontal-tech-rcs-account.entity';

@JSONSchema({
  $ref: '#/components/schemas/pontal-tech-rcs-accounts',
})
export class PontalTechRcsAccountDto {
  @IsUUID()
  @IsOptional()
  rcsAccountId: string;

  @IsString()
  @IsOptional()
  apiKey: string;

  @IsString()
  pontalTechAccountId: string;

  toEntity(
    override?: DeepPartial<
      PontalTechRcsAccountDto | PontalTechRcsAccountEntity
    >,
  ): DeepPartial<PontalTechRcsAccountEntity> {
    return {
      rcsAccountId: this.rcsAccountId,
      apiKey: this.apiKey,
      pontalTechAccountId: this.pontalTechAccountId,
      ...override,
    };
  }

  static fromEntity(
    entity: DeepPartial<PontalTechRcsAccountEntity>,
  ): PontalTechRcsAccountDto {
    if (!entity) {
      return null;
    }

    const dto = new PontalTechRcsAccountDto();

    dto.rcsAccountId = entity?.rcsAccountId;
    dto.apiKey = entity?.apiKey;
    dto.pontalTechAccountId = entity?.pontalTechAccountId;

    return dto;
  }
}
