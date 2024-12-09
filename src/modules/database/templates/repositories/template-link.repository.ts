import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { TemplateLinkEntity } from '../entities/template-link.entity';

@Injectable()
export class TemplateLinkRepository {
  constructor(
    @InjectRepository(TemplateLinkEntity)
    private readonly templateLinkRepository: Repository<TemplateLinkEntity>,
  ) {}

  async getById(id: string) {
    return await this.templateLinkRepository.findOne({
      where: { id },
      relations: {
        template: true,
      },
    });
  }

  async getAllByReference(companyToken: string, referenceId: string) {
    return await this.templateLinkRepository.find({
      where: {
        referenceId,
        template: {
          companyToken,
        },
      },
      relations: {
        template: true,
      },
    });
  }

  async create(channelLink: DeepPartial<TemplateLinkEntity>) {
    return await this.templateLinkRepository.save(channelLink);
  }

  async update(id: string, channelLink: DeepPartial<TemplateLinkEntity>) {
    return await this.templateLinkRepository.update(id, channelLink);
  }

  async upsert(id: string, channelLink: DeepPartial<TemplateLinkEntity>) {
    return await this.templateLinkRepository.upsert(channelLink, {
      conflictPaths: {
        referenceId: true,
        templateId: true,
      },
      skipUpdateIfNoValuesChanged: true,
      upsertType: 'on-conflict-do-update',
    });
  }

  async delete(id: string) {
    return await this.templateLinkRepository.delete(id);
  }
}
