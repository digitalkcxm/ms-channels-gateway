import { randomUUID } from 'node:crypto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import { ChatRepository } from '@/modules/database/rcs/repositories/chat.repository';

import { ChatDto } from '../models/chat.dto';
import { CreateChatDto } from '../models/create-chat.dto';

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

    const cacheKey = CacheKeyBuilder.getByBrokerChat({
      brokerChatId,
      includeRcsAccount,
    });

    const cached = await this.cacheManager.get<ChatDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.chatRepository
      .getByBrokerChat(brokerChatId, includeRcsAccount)
      .then(ChatDto.fromEntity);

    if (data) {
      await this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async getOrCreateChat(
    brokerChatId: string,
    rcsAccountId: string,
    referenceChatId?: string,
    includeRcsAccount = false,
    chatRepository?: Repository<ChatEntity>,
  ) {
    const existing = await this.getByBrokerChat(
      brokerChatId,
      includeRcsAccount,
    );

    if (existing) {
      return existing;
    }

    const chat = new CreateChatDto();
    chat.brokerChatId = brokerChatId;
    chat.rcsAccountId = rcsAccountId;
    chat.referenceChatId =
      referenceChatId || randomUUID({ disableEntropyCache: true });

    await this.create(chat, chatRepository);

    return await this.getByBrokerChat(brokerChatId, includeRcsAccount);
  }

  async create(entity: CreateChatDto, chatRepository?: Repository<ChatEntity>) {
    return await this.chatRepository
      .create(entity.toEntity(), chatRepository)
      .then(ChatDto.fromEntity);
  }
}

class CacheKeyBuilder {
  static getByBrokerChat({
    brokerChatId,
    includeRcsAccount,
    remove,
  }: {
    brokerChatId: string;
    includeRcsAccount?: boolean;
    remove?: boolean;
  }) {
    if (remove) {
      return `ms-channels-gateway:chat:brokerChat-${brokerChatId}-*`;
    }

    return `ms-channels-gateway:chat:brokerChat-${brokerChatId}-includeRcsAccount-${includeRcsAccount}`;
  }
}
