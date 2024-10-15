import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { InboundEventType } from '@/models/enums';
import { InboundMessage } from '@/models/inbound-message.model';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import {
  MessageDirection,
  MessageStatus,
} from '@/modules/database/rcs/entities/enums';
import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';
import { ChatRepository } from '@/modules/database/rcs/repositories/chat.repository';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { ChannelConfigService } from '@/modules/entity-manager/channels-gateway/services/channel-config.service';

import { InboundProducer } from '../producers/inbound.producer';

@Injectable()
export class RcsMessageService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly channelConfigService: ChannelConfigService,
    private readonly inboundProducer: InboundProducer,
  ) {}

  private readonly logger = new Logger(RcsMessageService.name);

  public async outboundMessage(
    channelConfigId: string,
    brokerMessageId: string,
    direction: MessageDirection,
    status: MessageStatus,
    message: any,
    chat: {
      id?: string;
      brokerChatId?: string;
      rcsAccountId: string;
    },
  ) {
    try {
      const result = await this.messageRepository.create({
        brokerMessageId,
        direction,
        rawMessage: message,
        status,
        chat,
      });

      const notifyMessage: RcsInboundMessage = {
        brokerChatId: chat.brokerChatId,
        brokerMessageId,
        direction,
        message,
        rcsAccountId: chat.rcsAccountId,
        status,
      };

      await this.notifyChangeStatus(
        InboundEventType.STATUS,
        notifyMessage,
        channelConfigId,
      );

      return result;
    } catch (error) {
      this.logger.error(error, 'outboundMessage');
      throw error;
    }
  }

  public async replyMessage(
    channelConfigId: string,
    inboundMessage: RcsInboundMessage,
  ) {
    this.logger.log(inboundMessage, 'replyMessage :: Message received');
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
      const { id: chatId } = await this.chatRepository.getOrCreateChat(
        brokerChatId,
        rcsAccountId,
        chatRepository,
      );

      const messageRepository =
        queryRunner.manager.getRepository(MessageEntity);

      await this.messageRepository.create(
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

      await this.notifyChangeStatus(
        InboundEventType.MESSAGE,
        message,
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

      if (newStatus !== message.status) {
        await this.messageRepository.update(message.id, {
          status: newStatus,
        });

        await this.notifyChangeStatus(
          InboundEventType.STATUS,
          { ...incomingMessage, status: newStatus },
          channelConfigId,
        );
      }
    } catch (error) {
      this.logger.error(error, 'syncStatus');
    }
  }

  private async notifyChangeStatus(
    type: InboundEventType,
    incomingMessage: RcsInboundMessage,
    channelConfigId: string,
  ) {
    delete incomingMessage.rcsAccountId;

    const inboundMessage: InboundMessage = {
      type,
      data: incomingMessage,
    };

    const { companyToken } = await this.channelConfigService.getById(
      channelConfigId,
      false,
    );

    this.logger.debug({ companyToken, inboundMessage }, 'notifyChangeStatus');

    await this.inboundProducer.publish(companyToken, inboundMessage);
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
