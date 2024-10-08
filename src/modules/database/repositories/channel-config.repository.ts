import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { ChannelConfigEntity } from '../entities/channel-config.entity';

@Injectable()
export class ChannelConfigRepository {
  constructor(
    @InjectRepository(ChannelConfigEntity)
    private readonly channelConfigRepository: Repository<ChannelConfigEntity>,
  ) {}

  async getAllByCompany(companyToken: string) {
    return await this.channelConfigRepository.find({
      where: { companyToken },
      relations: {
        links: true,
      },
    });
  }

  async getById(id: string) {
    return await this.channelConfigRepository.findOne({
      where: { id },
      relations: {
        links: true,
      },
    });
  }

  async create(channelConfig: DeepPartial<ChannelConfigEntity>) {
    return await this.channelConfigRepository.save(channelConfig);
  }

  async update(id: string, channelConfig: DeepPartial<ChannelConfigEntity>) {
    return await this.channelConfigRepository.update(
      { id, companyToken: channelConfig.companyToken },
      channelConfig,
    );
  }

  async delete(companyToken: string, id: string) {
    return await this.channelConfigRepository.delete({
      id,
      companyToken,
    });
  }
}
