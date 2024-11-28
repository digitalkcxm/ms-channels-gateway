import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { ChannelLinkEntity } from '../entities/channel-link.entity';

@Injectable()
export class ChannelLinkRepository {
  constructor(
    @InjectRepository(ChannelLinkEntity)
    private readonly channelLinkRepository: Repository<ChannelLinkEntity>,
  ) {}

  async getById(id: string) {
    return await this.channelLinkRepository.findOne({
      where: { id },
      relations: {
        channelConfig: true,
      },
    });
  }

  async getAllByReference(companyToken: string, referenceId: string) {
    return await this.channelLinkRepository.find({
      where: {
        referenceId,
        channelConfig: {
          companyToken,
        },
      },
      relations: {
        channelConfig: true,
      },
    });
  }

  async create(channelLink: DeepPartial<ChannelLinkEntity>) {
    return await this.channelLinkRepository.save(channelLink);
  }

  async update(id: string, channelLink: DeepPartial<ChannelLinkEntity>) {
    return await this.channelLinkRepository.update(id, channelLink);
  }

  async delete(id: string) {
    return await this.channelLinkRepository.delete(id);
  }
}
