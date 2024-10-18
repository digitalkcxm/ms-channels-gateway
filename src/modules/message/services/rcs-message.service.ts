import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { MessageDirection, MessageStatus } from '@/models/enums';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { SyncEventType, SyncModel } from '@/models/sync-message.model';
import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { ChannelConfigService } from '@/modules/entity-manager/channels-gateway/services/channel-config.service';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';

import { SyncProducer } from '../producers/sync.producer';
import { OutboundMessagePayload } from '@/models/outbound-message.model';
import { MessageDto } from '@/modules/entity-manager/rcs/models/message.dto';

@Injectable()
export class RcsMessageService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly channelConfigService: ChannelConfigService,
    private readonly chatService: ChatService,
    private readonly syncProducer: SyncProducer,
    private readonly messageRepository: MessageRepository,
  ) {}

  private readonly logger = new Logger(RcsMessageService.name);

  public async outboundMessage(
    channelConfigId: string,
    direction: MessageDirection,
    status: MessageStatus,
    recipient: string,
    outboundMessagePayload: OutboundMessagePayload,
    chat: {
      referenceChatId?: string;
      brokerChatId?: string;
      rcsAccountId: string;
    },
    brokerMessageId?: string,
    errorMessage?: string,
  ) {
    try {
      this.logger.debug(
        'outboundMessage :: outboundMessagePayload',
        outboundMessagePayload,
      );

      const dbChat = await this.chatService.getOrCreateChat(
        chat.brokerChatId,
        chat.rcsAccountId,
        chat.referenceChatId,
        true,
      );

      const dbMessage = await this.messageRepository.create({
        brokerMessageId,
        recipient,
        direction,
        rawMessage: outboundMessagePayload.content,
        status,
        chatId: dbChat.id,
        errorMessage,
      });

      await this.notify(
        {
          eventType: SyncEventType.STATUS,
          direction,
          status,
          referenceChatId: dbChat.referenceChatId,
          messageId: dbMessage.id,
          date: dbMessage.createdAt,
          message: outboundMessagePayload.content,
          errorMessage,
        },
        channelConfigId,
      );

      return dbMessage;
    } catch (error) {
      this.logger.error(error, 'outboundMessage');
      throw error;
    }
  }

  public async replyMessage(
    channelConfigId: string,
    inboundMessage: RcsInboundMessage,
  ) {
    this.logger.debug(inboundMessage, 'replyMessage :: Message received');

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const chatRepository = queryRunner.manager.getRepository(ChatEntity);
      const dbChat = await this.chatService.getOrCreateChat(
        inboundMessage.brokerChatId,
        inboundMessage.rcsAccountId,
        null,
        false,
        chatRepository,
      );

      const messageRepository =
        queryRunner.manager.getRepository(MessageEntity);

      this.logger.debug(inboundMessage.message, 'replyMessage :: Raw message');

      const dbMessage = await this.messageRepository.create(
        {
          brokerMessageId: inboundMessage.brokerMessageId,
          chatId: dbChat.id,
          direction: inboundMessage.direction,
          rawMessage: inboundMessage.message,
          status: inboundMessage.status,
          recipient: inboundMessage.recipient,
        },
        messageRepository,
      );

      await queryRunner.commitTransaction();

      await this.notify(
        {
          eventType: SyncEventType.STATUS,
          direction: inboundMessage.direction,
          status: inboundMessage.status,
          message: inboundMessage.message,
          referenceChatId: dbChat.referenceChatId,
          date: dbMessage.createdAt,
          messageId: dbMessage.id,
        },
        channelConfigId,
      );
    } catch (error) {
      this.logger.error(error, 'replyMessage');

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  public async syncStatus(
    channelConfigId: string,
    referenceChatId: string,
    existingMessage: MessageDto,
    incomingMessage: RcsInboundMessage,
  ) {
    try {
      const newStatus = this.getNewStatus(
        existingMessage.status,
        incomingMessage.status,
      );

      this.logger.debug(
        {
          message: existingMessage,
          currentStatus: existingMessage.status,
          newStatus: incomingMessage.status,
          parsedNewStatus: newStatus,
        },
        'syncStatus',
      );

      const errorMessage =
        newStatus === MessageStatus.ERROR
          ? (incomingMessage.message as string)
          : null;

      if (newStatus !== existingMessage.status) {
        const updatedMessage = await this.messageRepository.update(
          existingMessage.id,
          {
            status: newStatus,
            errorMessage,
          },
        );

        await this.notify(
          {
            eventType: SyncEventType.STATUS,
            direction: existingMessage.direction,
            status: newStatus,
            referenceChatId,
            messageId: existingMessage.id,
            date: updatedMessage.updatedAt,
            message: null,
            errorMessage,
          },
          channelConfigId,
        );
      }
    } catch (error) {
      this.logger.error(error, 'syncStatus');
    }
  }

  public async notify(model: SyncModel, channelConfigId: string) {
    if (!model) {
      this.logger.warn('notify :: model cannot be empty');
      return;
    }

    const { companyToken } = await this.channelConfigService.getById(
      channelConfigId,
      false,
    );

    this.logger.debug({ companyToken, model }, 'notify');

    await this.syncProducer.publish(companyToken, model);
  }

  private getNewStatus(currentStatus: MessageStatus, newStatus: MessageStatus) {
    if (
      currentStatus === MessageStatus.QUEUED ||
      [MessageStatus.ERROR].includes(newStatus)
    ) {
      return newStatus;
    }

    if (
      currentStatus === MessageStatus.SENT &&
      [MessageStatus.DELIVERED, MessageStatus.READ].includes(newStatus)
    ) {
      return newStatus;
    }

    if (
      currentStatus === MessageStatus.DELIVERED &&
      [MessageStatus.READ].includes(newStatus)
    ) {
      return newStatus;
    }

    return currentStatus;
  }
}
