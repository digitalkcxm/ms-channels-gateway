import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BrokerType } from '@/models/enums';
import { RcsAccountRepository } from '@/modules/database/rcs/repositories/rcs-account.repository';
import { CreateRcsAccountDto } from '@/modules/entity-manager/rcs/models/create-rcs-account.dto';
import { RcsAccountDto } from '@/modules/entity-manager/rcs/models/rcs-account.dto';
import { UpdateRcsAccountDto } from '@/modules/entity-manager/rcs/models/update-rcs-account.dto';

@Injectable()
export class RcsAccountService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly rcsAccountRepository: RcsAccountRepository,
  ) {}

  async getById(id: string, broker: BrokerType) {
    if (!broker) {
      throw new BadRequestException('Broker is required');
    }

    const cacheKey = `rcs-account-${id}-${broker}`;

    const cached = await this.cacheManager.get<RcsAccountDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.rcsAccountRepository
      .getById(id, broker)
      .then(RcsAccountDto.fromEntity);

    if (data) {
      await this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async getByReference(referenceId: string, broker: BrokerType) {
    if (!broker) {
      throw new BadRequestException('Broker is required');
    }

    const cacheKey = `rcs-account-reference-${referenceId}-${broker}`;

    const cached = await this.cacheManager.get<RcsAccountDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.rcsAccountRepository
      .getByReference(referenceId, broker)
      .then(RcsAccountDto.fromEntity);

    if (data) {
      await this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async create(entity: CreateRcsAccountDto) {
    return await this.rcsAccountRepository
      .create(entity.toEntity())
      .then(RcsAccountDto.fromEntity);
  }

  async update(id: string, entity: UpdateRcsAccountDto) {
    const data = await this.rcsAccountRepository.update(id, entity.toEntity());

    const cacheKey = `rcs-account-${id}-${entity.broker}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(
      `rcs-account-reference-${entity.referenceId}-${entity.broker}`,
    );

    return data;
  }

  async delete(id: string) {
    await this.rcsAccountRepository.delete(id);

    await this.cacheManager.del(`rcs-account-${id}-*`);
  }
}
