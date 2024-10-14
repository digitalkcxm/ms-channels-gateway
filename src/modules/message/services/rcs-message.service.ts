import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, DeepPartial } from 'typeorm';

import { InboundEventType } from '@/models/enums';
import { InboundMessage } from '@/models/inbound-message.model';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { BrokerType } from '@/modules/database/channels-gateway/entities/enums';
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
    broker: BrokerType,
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

      //TODO notificar status de QUEUED

      return result;
    } catch (error) {
      this.logger.error(error, 'MessageService :: saveMessage :: error');
    }
  }

  public async inboundMessage(
    channelConfigId: string,
    inboundMessage: RcsInboundMessage,
  ) {
    this.logger.log(inboundMessage, 'inboundMessage :: Message received');
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

      const result = await this.messageRepository.create(
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

      delete message.rcsAccountId;

      const { companyToken } = await this.channelConfigService.getById(
        channelConfigId,
        false,
      );

      await this.inboundProducer.publish(companyToken, message);

      return result;
    } catch (error) {
      this.logger.error(error, 'MessageService :: saveMessage :: error');

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

      if (newStatus === message.status) {
        return [false, message];
      }

      this.logger.debug(
        {
          message,
          currentStatus: message.status,
          newStatus: incomingMessage.status,
          parsedNewStatus: newStatus,
        },
        'syncStatus',
      );

      const result = await this.messageRepository.update(message.id, {
        status: newStatus,
      });

      delete incomingMessage.rcsAccountId;

      const { companyToken } = await this.channelConfigService.getById(
        channelConfigId,
        false,
      );

      const inboundMessage: InboundMessage = {
        type: incomingMessage.message
          ? InboundEventType.MESSAGE
          : InboundEventType.STATUS,
        data: incomingMessage,
      };

      await this.inboundProducer.publish(companyToken, inboundMessage);

      return result.raw as DeepPartial<MessageEntity>;
    } catch (error) {
      this.logger.error(error, 'syncStatus');
    }
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
