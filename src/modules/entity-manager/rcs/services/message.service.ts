import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MessageDirection } from '@/models/enums';
import { PaginatedDto } from '@/models/paginated.dto';
import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';

import { MessageDto } from '../models/message.dto';

@Injectable()
export class MessageService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly messageRepository: MessageRepository,
  ) {}

  async getById(id: string) {
    if (!id) {
      throw new BadRequestException('id is required');
    }

    const cacheKey = CacheKeyBuilder.getById(id);

    const cached = await this.cacheManager.get<MessageDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.messageRepository
      .getBy(
        {
          id,
        },
        {
          chat: {
            rcsAccount: true,
          },
        },
      )
      .then(MessageDto.fromEntity);

    if (data) {
      await this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async getByOutboundBrokerMessage(brokerMessageId: string) {
    if (!brokerMessageId) {
      throw new BadRequestException('brokerMessageId is required');
    }

    const cacheKey =
      CacheKeyBuilder.getByOutboundBrokerMessage(brokerMessageId);

    const cached = await this.cacheManager.get<MessageDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.messageRepository
      .getBy(
        {
          brokerMessageId,
          direction: MessageDirection.OUTBOUND,
        },
        {
          chat: {
            rcsAccount: true,
          },
        },
      )
      .then(MessageDto.fromEntity);

    if (data) {
      await this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

  async getLastMessageByRecipient(recipient: string) {
    if (!recipient) {
      throw new BadRequestException('recipient is required');
    }

    const cacheKey = CacheKeyBuilder.getLastByRecipient(recipient);

    const cached = await this.cacheManager.get<MessageDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.messageRepository
      .getLastMessageByRecipient(recipient, {
        chat: {
          rcsAccount: true,
        },
      })
      .then(MessageDto.fromEntity);

    if (data) {
      await this.cacheManager.set(cacheKey, data);
    }

    return data;
  }

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

  async getPagedByReferenceChat(
    referenceChatId: string,
    offset: number,
    limit: number,
  ) {
    return this.messageRepository
      .getPagedBy(offset, limit, {
        chat: {
          referenceChatId,
        },
      })
      .then(([rows, total]) =>
        PaginatedDto.create(
          rows?.map(MessageDto.fromEntity),
          total,
          offset,
          limit,
        ),
      );
  }

  async create(
    entity: MessageDto,
    messageRepository?: Repository<MessageEntity>,
  ) {
    const dbResult = await this.messageRepository
      .create(entity.toEntity(), messageRepository)
      .then(MessageDto.fromEntity);

    if (dbResult) {
      this.cacheManager.del(
        CacheKeyBuilder.getLastByRecipient(entity.recipient),
      );
    }

    return dbResult;
  }
}

class CacheKeyBuilder {
  static getById(id: string) {
    return `ms-channels-gateway:message:id-${id}`;
  }

  static getLastByRecipient(recipient: string) {
    return `ms-channels-gateway:message:recipient-${recipient}`;
  }

  static getByOutboundBrokerMessage(brokerMessageId: string) {
    return `ms-channels-gateway:message:outbound-brokerMessageId-${brokerMessageId}`;
  }

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
