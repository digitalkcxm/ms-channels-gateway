import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  async getById(id: string) {
    return await this.chatRepository.findOne({
      where: { id },
    });
  }

  async getByBrokerChat(brokerChatId: string, includeRcsAccount = false) {
    return await this.chatRepository.findOne({
      where: { brokerChatId },
      relations: {
        rcsAccount: includeRcsAccount,
      },
    });
  }

  async getOrCreateChat(
    brokerChatId: string,
    rcsAccountId: string,
    queryRunnerRepository: Repository<ChatEntity>,
  ) {
    const chat = await this.getByBrokerChat(brokerChatId);

    if (!chat) {
      return await this.create(
        {
          brokerChatId,
          rcsAccountId,
        },
        queryRunnerRepository,
      );
    }

    return chat;
  }

  async create(
    entity: DeepPartial<ChatEntity>,
    repository?: Repository<ChatEntity>,
  ) {
    return await (repository || this.chatRepository).save(entity);
  }

  async update(
    id: string,
    entity: DeepPartial<ChatEntity>,
    repository?: Repository<ChatEntity>,
  ) {
    return await (repository || this.chatRepository).update({ id }, entity);
  }

  async delete(id: string, repository?: Repository<ChatEntity>) {
    return await (repository || this.chatRepository).delete({
      id,
    });
  }
}
