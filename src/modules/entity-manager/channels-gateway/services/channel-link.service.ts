import { Injectable } from '@nestjs/common';

import { ChannelLinkRepository } from '@/modules/database/channels-gateway/repositories/channel-link.repository';
import { ChannelLinkDto } from '@/modules/entity-manager/channels-gateway/models/channel-link.dto';
import { CreateChannelLinkDto } from '@/modules/entity-manager/channels-gateway/models/create-channel-link.dto';
import { UpdateChannelLinkDto } from '@/modules/entity-manager/channels-gateway/models/update-channel-link.dto';

@Injectable()
export class ChannelLinkService {
  constructor(private readonly channelLinkRepository: ChannelLinkRepository) {}

  async getById(id: string) {
    return await this.channelLinkRepository
      .getById(id)
      .then(ChannelLinkDto.fromEntity);
  }

  async getAllByReference(referenceId: string) {
    return await this.channelLinkRepository
      .getAllByReference(referenceId)
      .then((rows) => rows?.map(ChannelLinkDto.fromEntity));
  }

  async create(dto: CreateChannelLinkDto) {
    return await this.channelLinkRepository
      .create(dto.toEntity())
      .then(ChannelLinkDto.fromEntity);
  }

  async update(id: string, dto: UpdateChannelLinkDto) {
    return await this.channelLinkRepository.update(id, dto.toEntity());
  }

  async delete(id: string) {
    return await this.channelLinkRepository.delete(id);
  }
}
