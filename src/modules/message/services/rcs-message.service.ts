import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { MessageDirection, MessageStatus } from '@/models/enums';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { RcsMessageModel } from '@/models/rsc-message.model';
import {
  SyncEventType,
  SyncMessageMapper,
  SyncModel,
} from '@/models/sync-message.model';
import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { ChannelConfigService } from '@/modules/entity-manager/channels-gateway/services/channel-config.service';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';

import { SyncProducer } from '../producers/sync.producer';

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
    rcsMessage: RcsMessageModel,
    chat: {
      id?: string;
      brokerChatId?: string;
      rcsAccountId: string;
    },
    brokerMessageId?: string,
    errorMessage?: string,
  ) {
    try {
      const message = await this.messageRepository.create({
        brokerMessageId,
        direction,
        rawMessage: {
          type: rcsMessage.messageType,
          [rcsMessage.messageType]:
            rcsMessage.content?.[rcsMessage.messageType],
        },
        status,
        chat,
        errorMessage,
      });

      const notifyMessage = SyncMessageMapper.fromRcsMessageModel(
        SyncEventType.MESSAGE,
        direction,
        status,
        chat.id,
        message.id,
        message.createdAt,
        rcsMessage,
        errorMessage,
      );

      await this.notify(notifyMessage, channelConfigId);

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
    } = inboundMessage;

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const chatRepository = queryRunner.manager.getRepository(ChatEntity);
      const { id: chatId } = await this.chatService.getOrCreateChat(
        brokerChatId,
        rcsAccountId,
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
        },
        messageRepository,
      );

      await queryRunner.commitTransaction();

      const notifyMessage = SyncMessageMapper.fromRcsInboundModel(
        SyncEventType.MESSAGE,
        direction,
        status,
        chatId,
        dbMessage.id,
        dbMessage.createdAt,
        inboundMessage,
      );

      await this.notify(notifyMessage, channelConfigId);
    } catch (error) {
      this.logger.error(error, 'replyMessage');

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  public async syncStatus(
    channelConfigId: string,
    message: MessageEntity,
    incomingMessage: RcsInboundMessage,
  ) {
    try {
      const newStatus = this.getNewStatus(
        message.status,
        incomingMessage.status,
      );

      this.logger.debug(
        {
          message,
          currentStatus: message.status,
          newStatus: incomingMessage.status,
          parsedNewStatus: newStatus,
        },
        'syncStatus',
      );

      const errorMessage =
        newStatus === MessageStatus.ERROR ? incomingMessage.message : null;

      if (newStatus !== message.status) {
        const updatedMessage = await this.messageRepository.update(message.id, {
          status: newStatus,
          errorMessage,
        });

        const notifyMessage: SyncModel = SyncMessageMapper.fromRcsInboundModel(
          SyncEventType.STATUS,
          updatedMessage.direction,
          newStatus,
          updatedMessage.chatId,
          updatedMessage.id,
          updatedMessage.updatedAt,
          incomingMessage,
        );

        await this.notify(notifyMessage, channelConfigId);
      }
    } catch (error) {
      this.logger.error(error, 'syncStatus');
    }
  }

  private async notify(model: SyncModel, channelConfigId: string) {
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
