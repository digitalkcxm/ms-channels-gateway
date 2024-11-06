import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async getBy(
    where: FindOptionsWhere<MessageEntity>,
    relations?: FindOptionsRelations<MessageEntity>,
  ) {
    return await this.messageRepository.findOne({
      where,
      relations,
    });
  }

  async getPagedBy(
    offset: number,
    limit: number,
    where: FindOptionsWhere<MessageEntity>,
    relations?: FindOptionsRelations<MessageEntity>,
  ) {
    return await this.messageRepository.findAndCount({
      where,
      relations,
      skip: offset,
      take: limit,
    });
  }

  async getById(id: string) {
    return await this.messageRepository.findOne({
      where: { id },
    });
  }

  async getByChat(chatId: string) {
    return await this.messageRepository.findOne({
      where: { chatId },
    });
  }

  async create(
    entity: DeepPartial<MessageEntity>,
    repository?: Repository<MessageEntity>,
  ) {
    return await (repository || this.messageRepository).save(entity);
  }

  async update(
    id: string,
    entity: DeepPartial<MessageEntity>,
    repository?: Repository<MessageEntity>,
  ) {
    const updatedEntity: DeepPartial<MessageEntity> = {
      ...entity,
      updatedAt: new Date(),
    };

    await (repository || this.messageRepository).update({ id }, updatedEntity);

    return updatedEntity as MessageEntity;
  }

  async delete(id: string, repository?: Repository<MessageEntity>) {
    return await (repository || this.messageRepository).delete({
      id,
    });
  }
}
