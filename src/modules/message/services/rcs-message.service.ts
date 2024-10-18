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
      id?: string;
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
      const message = await this.messageRepository.create({
        brokerMessageId,
        recipient,
        direction,
        rawMessage: outboundMessagePayload.content,
        status,
        chat,
        errorMessage,
      });

      await this.notify(
        {
          eventType: SyncEventType.STATUS,
          direction,
          status,
          chatId: chat.id,
          messageId: message.id,
          date: message.createdAt,
          message: outboundMessagePayload.content,
          errorMessage,
        },
        channelConfigId,
      );

      return message;
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

    const {
      rcsAccountId,
      brokerChatId,
      brokerMessageId,
      direction,
      status,
      message,
      recipient,
    } = inboundMessage;

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const chatRepository = queryRunner.manager.getRepository(ChatEntity);
      const { id: chatId } = await this.chatService.getOrCreateChat(
        brokerChatId,
        rcsAccountId,
        false,
        chatRepository,
      );

      const messageRepository =
        queryRunner.manager.getRepository(MessageEntity);

      this.logger.debug(message, 'replyMessage :: Raw Message');

      const dbMessage = await this.messageRepository.create(
        {
          brokerMessageId,
          chatId,
          direction,
          rawMessage: message,
          status,
          recipient,
        },
        messageRepository,
      );

      await queryRunner.commitTransaction();

      await this.notify(
        {
          eventType: SyncEventType.STATUS,
          direction,
          status,
          message: inboundMessage.message,
          chatId,
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
    existingMessage: MessageEntity,
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
            direction: updatedMessage.direction,
            status: newStatus,
            chatId: updatedMessage.chatId,
            messageId: updatedMessage.id,
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
