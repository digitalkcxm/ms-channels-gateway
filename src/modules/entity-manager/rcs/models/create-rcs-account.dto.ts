import { OmitType } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { RcsAccountEntity } from '@/modules/database/rcs/entities/rcs-account.entity';

import { RcsAccountDto } from './rcs-account.dto';

export class CreateRcsAccountDto extends OmitType(RcsAccountDto, [
  'id',
  'toEntity',
] as const) {
  toEntity(
    override?: DeepPartial<RcsAccountEntity>,
  ): DeepPartial<RcsAccountEntity> {
    return {
      referenceId: this.referenceId,
      broker: this.broker,
      pontalTechRcsAccount: this.pontalTechRcsAccount?.toEntity(),
      ...override,
    };
  }
}
