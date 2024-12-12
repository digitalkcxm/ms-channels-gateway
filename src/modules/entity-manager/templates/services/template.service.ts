import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { TemplateLinkRepository } from '@/modules/database/templates/repositories';
import { TemplateRepository } from '@/modules/database/templates/repositories/template.repository';

import { CreateTemplateDto, TemplateDto, UpdateTemplateDto } from '../models';

@Injectable()
export class TemplateService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly templateRepository: TemplateRepository,
    private readonly templateLinkRepository: TemplateLinkRepository,
  ) {}

  async getById(id: string, includeLinks = true) {
    const cacheKey = CacheKeyBuilder.getById({ id, includeLinks });

    const cached = await this.cacheManager.get<TemplateDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.templateRepository
      .getById(id, includeLinks)
      .then(TemplateDto.fromEntity);

    if (data) {
      this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async getAllByCompany(companyToken: string, referenceId?: string) {
    const cacheKey = CacheKeyBuilder.getAllByCompany({
      companyToken,
      referenceId,
    });

    const cached = await this.cacheManager.get<TemplateDto[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.templateRepository
      .getAllByCompany(companyToken, referenceId)
      .then((rows) => rows?.map(TemplateDto.fromEntity));

    if (data) {
      this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async create(companyToken: string, entity: CreateTemplateDto) {
    const data = await this.templateRepository
      .create(entity.toEntity({ companyToken }))
      .then(TemplateDto.fromEntity);

    Promise.all(
      entity.links?.map(({ referenceId }) =>
        this.cacheManager.del(
          CacheKeyBuilder.getAllByCompany({ companyToken, referenceId }),
        ),
      ),
    );

    this.cacheManager.del(CacheKeyBuilder.getAllByCompany({ companyToken }));

    return data;
  }

  async update(companyToken: string, id: string, entity: UpdateTemplateDto) {
    const links = [...entity.links];

    delete entity.links;

    await Promise.all([
      this.templateRepository.update(id, entity.toEntity({ companyToken })),
      links.map((link) => this.templateLinkRepository.upsert(link.id, link)),
    ]);

    const delKeys = await this.cacheManager.store.keys(
      CacheKeyBuilder.getById({
        id,
        remove: true,
      }),
    );

    Promise.all(delKeys?.map((key) => this.cacheManager.del(key)));

    this.cacheManager.del(CacheKeyBuilder.getAllByCompany({ companyToken }));

    Promise.all(
      entity.links?.map(({ referenceId }) =>
        this.cacheManager.del(
          CacheKeyBuilder.getAllByCompany({ companyToken, referenceId }),
        ),
      ),
    );
  }

  async delete(companyToken: string, id: string) {
    await this.templateRepository.delete(companyToken, id);

    await this.cacheManager.del(
      CacheKeyBuilder.getAllByCompany({ companyToken }),
    );

    const delKeys = await this.cacheManager.store.keys(
      CacheKeyBuilder.getById({
        id,
        remove: true,
      }),
    );
    Promise.all(delKeys?.map((key) => this.cacheManager.del(key)));
  }
}

class CacheKeyBuilder {
  static getById({
    id,
    includeLinks,
    remove,
  }: {
    id: string;
    includeLinks?: boolean;
    remove?: boolean;
  }) {
    if (remove) {
      return `ms-channels-gateway:template:id-${id}-*`;
    }

    return `ms-channels-gateway:template:id-${id}-includeLinks-${includeLinks}`;
  }

  static getAllByCompany({
    companyToken,
    referenceId,
  }: {
    companyToken: string;
    referenceId?: string;
  }) {
    return `ms-channels-gateway:template:company-${companyToken}:referenceId-${referenceId}`;
  }
}
