import { randomUUID } from 'node:crypto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import { ChatRepository } from '@/modules/database/rcs/repositories/chat.repository';

import { ChatDto } from '../models/chat.dto';
import { CreateChatDto } from '../models/create-chat.dto';
import { MessageDto } from '../models/message.dto';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';

@Injectable()
export class MessageService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly messageRepository: MessageRepository,
  ) {}

  async getByBrokerMessage(brokerMessageId: string, chatId: string) {
    if (!brokerMessageId) {
      throw new BadRequestException('brokerMessageId is required');
    }

    if (!chatId) {
      throw new BadRequestException('chatId is required');
    }

    const cacheKey = CacheKeyBuilder.getByBrokerMessage({
      brokerMessageId,
      chatId,
    });

    const cached = await this.cacheManager.get<MessageDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.messageRepository
      .getBy({
        brokerMessageId,
        chatId,
      })
      .then(MessageDto.fromEntity);

    if (data) {
      await this.cacheManager.set(cacheKey, data);
    }

    return data;
  }
}

class CacheKeyBuilder {
  static getByBrokerMessage({
    brokerMessageId,
    chatId,
    remove,
  }: {
    brokerMessageId: string;
    chatId?: string;
    remove?: boolean;
  }) {
    if (remove) {
      return `ms-channels-gateway:message:brokerMessageId-${brokerMessageId}-*`;
    }

    return `ms-channels-gateway:chat:brokerMessageId-${brokerMessageId}-chatId-${chatId}`;
  }
}
