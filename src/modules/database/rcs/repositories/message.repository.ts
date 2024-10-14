import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

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
    return await (repository || this.messageRepository).update({ id }, entity);
  }

  async delete(id: string, repository?: Repository<MessageEntity>) {
    return await (repository || this.messageRepository).delete({
      id,
    });
  }
}
