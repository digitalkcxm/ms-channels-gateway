import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { TemplateLinkRepository } from '@/modules/database/templates/repositories';

import {
  CreateTemplateLinkDto,
  TemplateLinkDto,
  UpdateTemplateLinkDto,
} from '../models';

@Injectable()
export class TemplateLinkService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly channelLinkRepository: TemplateLinkRepository,
  ) {}

  async getById(id: string) {
    const cacheKey = CacheKeyBuilder.getById({ id });

    const cached = await this.cacheManager.get<TemplateLinkDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.channelLinkRepository
      .getById(id)
      .then(TemplateLinkDto.fromEntity);

    if (data) {
      this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async getAllByReference(companyToken: string, referenceId: string) {
    const cacheKey = CacheKeyBuilder.getAllByReference({
      companyToken,
      referenceId,
    });

    const cached = await this.cacheManager.get<TemplateLinkDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.channelLinkRepository
      .getAllByReference(companyToken, referenceId)
      .then((rows) => rows?.map(TemplateLinkDto.fromEntity));

    if (data) {
      this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async create(dto: CreateTemplateLinkDto) {
    return await this.channelLinkRepository
      .create(dto.toEntity())
      .then(TemplateLinkDto.fromEntity);
  }

  async update(companyToken: string, id: string, dto: UpdateTemplateLinkDto) {
    const data = await this.channelLinkRepository.update(id, dto.toEntity());

    this.cacheManager.del(CacheKeyBuilder.getById({ id }));
    this.cacheManager.del(
      CacheKeyBuilder.getAllByReference({
        companyToken,
        referenceId: dto.referenceId,
      }),
    );

    return data;
  }

  async delete(companyToken: string, id: string) {
    const data = await this.getById(id);

    await this.channelLinkRepository.delete(id);

    this.cacheManager.del(CacheKeyBuilder.getById({ id }));
    this.cacheManager.del(
      CacheKeyBuilder.getAllByReference({
        companyToken,
        referenceId: data.referenceId,
      }),
    );
  }
}

class CacheKeyBuilder {
  static getById({ id }: { id: string }) {
    return `ms-channels-gateway:template-link:id-${id}`;
  }

  static getAllByReference({
    companyToken,
    referenceId,
  }: {
    companyToken: string;
    referenceId: string;
  }) {
    return `ms-channels-gateway:template-link:company-${companyToken}:referenceId-${referenceId}`;
  }
}
