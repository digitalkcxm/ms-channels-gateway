import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { BrokerType } from '@/models/enums';
import { RcsAccountEntity } from '@/modules/database/rcs/entities/rcs-account.entity';

@Injectable()
export class RcsAccountRepository {
  constructor(
    @InjectRepository(RcsAccountEntity)
    private readonly rcsAccountRepository: Repository<RcsAccountEntity>,
  ) {}

  async getById(id: string, broker: BrokerType) {
    return await this.rcsAccountRepository.findOne({
      where: { id },
      relations: {
        pontalTechRcsAccount: broker === BrokerType.PONTAL_TECH,
      },
    });
  }

  async getByReference(referenceId: string, broker: BrokerType) {
    return await this.rcsAccountRepository.findOne({
      where: { referenceId },
      relations: {
        pontalTechRcsAccount: broker === BrokerType.PONTAL_TECH,
      },
    });
  }

  async create(entity: DeepPartial<RcsAccountEntity>) {
    return await this.rcsAccountRepository.save(entity);
  }

  async update(id: string, entity: DeepPartial<RcsAccountEntity>) {
    return await this.rcsAccountRepository.update({ id }, entity);
  }

  async delete(id: string) {
    return await this.rcsAccountRepository.delete({
      id,
    });
  }
}
