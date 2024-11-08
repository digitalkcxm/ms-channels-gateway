import { getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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
import { BrokerType } from '@/models/enums';
import { RcsAccountEntity } from '@/modules/database/rcs/entities/rcs-account.entity';

import { PontalTechRcsAccountDto } from './pontal-tech-rcs-account.dto';

@JSONSchema({
  $ref: getSchemaPath(RcsAccountDto),
})
export class RcsAccountDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsString()
  referenceId: string;

  @IsEnum(BrokerType)
  broker: BrokerType;

  @ValidateNested()
  @Type(() => PontalTechRcsAccountDto)
  @JSONSchema({
    ...dtoToJsonSchema(PontalTechRcsAccountDto),
  })
  @IsOptional()
  pontalTechRcsAccount?: PontalTechRcsAccountDto;

  toEntity(
    override?: DeepPartial<RcsAccountDto | RcsAccountEntity>,
  ): DeepPartial<RcsAccountEntity> {
    return {
      id: this.id,
      referenceId: this.referenceId,
      broker: this.broker,
      pontalTechRcsAccount: this.pontalTechRcsAccount?.toEntity(),
      ...override,
    };
  }

  static fromEntity(entity: DeepPartial<RcsAccountEntity>): RcsAccountDto {
    if (!entity) {
      return null;
    }

    const dto = new RcsAccountDto();

    dto.id = entity?.id;
    dto.referenceId = entity?.referenceId;
    dto.broker = entity?.broker;
    dto.pontalTechRcsAccount = PontalTechRcsAccountDto.fromEntity(
      entity?.pontalTechRcsAccount,
    );

    return dto;
  }
}
