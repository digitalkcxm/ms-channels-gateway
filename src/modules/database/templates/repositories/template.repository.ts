import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { TemplateEntity } from '../entities/template.entity';

@Injectable()
export class TemplateRepository {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templateRepository: Repository<TemplateEntity>,
  ) {}

  async getAllByCompany(companyToken: string) {
    return await this.templateRepository.find({
      where: { companyToken },
      relations: { links: true },
    });
  }

  async getById(id: string, includeLinks = true) {
    return await this.templateRepository.findOne({
      where: { id },
      relations: {
        links: includeLinks,
      },
    });
  }

  async create(entity: DeepPartial<TemplateEntity>) {
    return await this.templateRepository.save(entity);
  }

  async update(id: string, entity: DeepPartial<TemplateEntity>) {
    return await this.templateRepository.update(
      { id, companyToken: entity.companyToken },
      entity,
    );
  }

  async delete(companyToken: string, id: string) {
    return await this.templateRepository.delete({
      id,
      companyToken,
    });
  }
}
