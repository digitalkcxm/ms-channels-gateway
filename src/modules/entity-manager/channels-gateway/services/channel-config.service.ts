import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { ChannelConfigRepository } from '@/modules/database/channels-gateway/repositories/channel-config.repository';
import { ChannelConfigDto } from '@/modules/entity-manager/channels-gateway/models/channel-config.dto';
import { CreateChannelConfigDto } from '@/modules/entity-manager/channels-gateway/models/create-channel-config.dto';
import { UpdateChannelConfigDto } from '@/modules/entity-manager/channels-gateway/models/update-channel-config.dto';

@Injectable()
export class ChannelConfigService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly channelConfigRepository: ChannelConfigRepository,
  ) {}

  async getById(id: string, includeLinks = true) {
    const cacheKey = `channel-config-${id}`;

    const cached = await this.cacheManager.get<ChannelConfigDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.channelConfigRepository
      .getById(id, includeLinks)
      .then(ChannelConfigDto.fromEntity);

    await this.cacheManager.set(cacheKey, data);

    return data;
  }

  async getAllByCompany(companyToken: string) {
    const cacheKey = `channel-configs-by-company-${companyToken}`;

    const cached = await this.cacheManager.get<ChannelConfigDto[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.channelConfigRepository
      .getAllByCompany(companyToken)
      .then((rows) => rows?.map(ChannelConfigDto.fromEntity));

    await this.cacheManager.set(cacheKey, data);

    return data;
  }

  async create(companyToken: string, entity: CreateChannelConfigDto) {
    const data = await this.channelConfigRepository
      .create(entity.toEntity({ companyToken }))
      .then(ChannelConfigDto.fromEntity);

    await this.cacheManager.del(`channel-configs-by-company-${companyToken}`);
    await this.cacheManager.del(`channel-config-${data.id}`);

    return data;
  }

  async update(
    companyToken: string,
    id: string,
    entity: UpdateChannelConfigDto,
  ) {
    const data = await this.channelConfigRepository.update(
      id,
      entity.toEntity({ companyToken }),
    );

    await this.cacheManager.del(`channel-configs-by-company-${companyToken}`);
    await this.cacheManager.del(`channel-config-${id}`);

    return data;
  }

  async delete(companyToken: string, id: string) {
    await this.channelConfigRepository.delete(companyToken, id);

    await this.cacheManager.del(`channel-configs-by-company-${companyToken}`);
    await this.cacheManager.del(`channel-config-${id}`);
  }
}
