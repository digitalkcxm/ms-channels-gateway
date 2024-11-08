import { OmitType, PartialType } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { RcsAccountEntity } from '@/modules/database/rcs/entities/rcs-account.entity';

import { RcsAccountDto } from './rcs-account.dto';

export class UpdateRcsAccountDto extends PartialType(
  OmitType(RcsAccountDto, ['id', 'toEntity'] as const),
) {
  toEntity(
    override?: DeepPartial<RcsAccountDto | RcsAccountEntity>,
  ): DeepPartial<RcsAccountEntity> {
    return {
      referenceId: this.referenceId,
      broker: this.broker,
      ...override,
    };
  }
}
