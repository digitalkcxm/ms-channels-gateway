import { Injectable } from '@nestjs/common';

import { ChannelConfigRepository } from '@/modules/database/repositories/channel-config.repository';
import { ChannelConfigDto } from '@/modules/entity-manager/models/channel-config.dto';
import { CreateChannelConfigDto } from '@/modules/entity-manager/models/create-channel-config.dto';
import { UpdateChannelConfigDto } from '@/modules/entity-manager/models/update-channel-config.dto';

@Injectable()
export class ChannelConfigService {
  constructor(
    private readonly channelConfigRepository: ChannelConfigRepository,
  ) {}

  async getById(id: string) {
    return await this.channelConfigRepository
      .getById(id)
      .then(ChannelConfigDto.fromEntity);
  }

  async getAllByCompany(companyToken: string) {
    return await this.channelConfigRepository
      .getAllByCompany(companyToken)
      .then((rows) => rows?.map(ChannelConfigDto.fromEntity));
  }

  async create(companyToken: string, entity: CreateChannelConfigDto) {
    return await this.channelConfigRepository
      .create(entity.toEntity({ companyToken }))
      .then(ChannelConfigDto.fromEntity);
  }

  async update(
    companyToken: string,
    id: string,
    entity: UpdateChannelConfigDto,
  ) {
    return await this.channelConfigRepository.update(
      id,
      entity.toEntity({ companyToken }),
    );
  }

  async delete(companyToken: string, id: string) {
    await this.channelConfigRepository.delete(companyToken, id);
  }
}
