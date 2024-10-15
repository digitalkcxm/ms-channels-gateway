import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import { ChatRepository } from '@/modules/database/rcs/repositories/chat.repository';
import { RcsAccountDto } from '@/modules/entity-manager/rcs/models/rcs-account.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly chatRepository: ChatRepository,
  ) {}

  async getByBrokerChat(brokerChatId: string, includeRcsAccount = false) {
    if (!brokerChatId) {
      throw new BadRequestException('BrokerChatId is required');
    }

    const cacheKey = `channels-gateway-chat-${brokerChatId}-${includeRcsAccount}`;

    const cached = await this.cacheManager.get<RcsAccountDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.chatRepository
      .getByBrokerChat(brokerChatId, includeRcsAccount)
      .then(RcsAccountDto.fromEntity);

    await this.cacheManager.set(cacheKey, data);

    return data;
  }

  async getOrCreateChat(
    brokerChatId: string,
    rcsAccountId: string,
    chatRepository: Repository<ChatEntity>,
  ) {
    const existing = await this.getByBrokerChat(brokerChatId);

    if (existing) {
      return existing;
    }

    const data = await this.chatRepository
      .create(
        {
          brokerChatId,
          rcsAccountId,
        },
        chatRepository,
      )
      .then(RcsAccountDto.fromEntity);

    return data;
  }
}
