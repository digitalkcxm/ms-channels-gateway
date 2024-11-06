import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

import * as crypto from 'node:crypto';

import { EnvVars } from '@/config/env-vars';
import { MessageDirection, MessageStatus } from '@/models/enums';
import { InboundMediaMessage } from '@/models/inbound-message.model';
import { OutboundMessagePayload } from '@/models/outbound-message.model';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import {
  RcsMessageCarouselContentDto,
  RcsMessageDocumentContentDto,
  RcsMessageRichCardContentDto,
} from '@/models/rsc-message.dto';
import { SyncEventType, SyncModel } from '@/models/sync-message.model';
import { AwsS3Service } from '@/modules/aws-s3/aws-s3.service';
import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { ChannelConfigService } from '@/modules/entity-manager/channels-gateway/services/channel-config.service';
import { MessageDto } from '@/modules/entity-manager/rcs/models/message.dto';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';
import { MessageService } from '@/modules/entity-manager/rcs/services/message.service';

import { InboundProducer } from '../producers/inbound.producer';
import { SyncProducer } from '../producers/sync.producer';

@Injectable()
export class RcsMessageService {
  constructor(
    private readonly s3Service: AwsS3Service,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService<EnvVars>,
    private readonly httpService: HttpService,
    private readonly channelConfigService: ChannelConfigService,
    private readonly chatService: ChatService,
    private readonly syncProducer: SyncProducer,
    private readonly messageRepository: MessageRepository,
    private readonly messageService: MessageService,
    private readonly inboundProducer: InboundProducer,
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
          eventType: SyncEventType.MESSAGE,
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

  public async inboundMessage(
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

      this.logger.debug(inboundMessage.message, 'replyMessage :: Raw message');

      const messageRepository =
        queryRunner.manager.getRepository(MessageEntity);

      const dbMessage = await this.messageRepository.create(
        {
          brokerMessageId: inboundMessage.brokerMessageId,
          chatId: dbChat.id,
          direction: inboundMessage.direction,
          rawMessage: inboundMessage.message,
          errorMessage: inboundMessage.errorMessage,
          status: inboundMessage.status,
          recipient: inboundMessage.recipient,
        },
        messageRepository,
      );

      await queryRunner.commitTransaction();

      await this.notify(
        {
          eventType: SyncEventType.MESSAGE,
          direction: inboundMessage.direction,
          status: inboundMessage.status,
          referenceChatId: dbChat.referenceChatId,
          messageId: dbMessage.id,
          date: dbMessage.createdAt,
          message: inboundMessage.message,
        },
        channelConfigId,
      );

      if (inboundMessage.message?.messageType !== 'text') {
        await this.inboundProducer.media({
          brokerMessageId: inboundMessage.brokerMessageId,
          chatId: dbChat.id,
          referenceChatId: dbChat.referenceChatId,
          channelConfigId,
          payload: inboundMessage.message,
        });
      }
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

      if (newStatus !== existingMessage.status) {
        const updatedMessage = await this.messageRepository.update(
          existingMessage.id,
          {
            status: newStatus,
            errorMessage: incomingMessage.errorMessage,
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
            message: incomingMessage.message,
            errorMessage: incomingMessage.errorMessage,
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

    const { companyToken, channel, broker } =
      await this.channelConfigService.getById(channelConfigId, false);

    this.logger.debug(
      {
        companyToken,
        model: {
          channel,
          broker,
          ...model,
          channelConfigId,
        },
      },
      'notify',
    );

    await this.syncProducer.publish(companyToken, {
      channel,
      broker,
      ...model,
      channelConfigId,
    } as SyncModel);
  }

  public async mediaProcess({
    brokerMessageId,
    chatId,
    referenceChatId,
    channelConfigId,
    payload,
  }: InboundMediaMessage) {
    const dbMessage = await this.messageService.getByBrokerMessage(
      brokerMessageId,
      chatId,
    );

    if (
      ['document', 'audio', 'image', 'video'].includes(payload?.messageType)
    ) {
      const message = {
        ...(payload as RcsMessageDocumentContentDto),
      };

      if (message) {
        const awsUrl = await this.importMedia(
          message.url,
          message.fileName,
          message.mimeType,
        );

        const updatedMessage: RcsMessageDocumentContentDto = {
          ...message,
          url: awsUrl,
        };

        await this.messageRepository.update(dbMessage.id, {
          rawMessage: updatedMessage,
          status: MessageStatus.DELIVERED,
        });

        await this.notify(
          {
            eventType: SyncEventType.STATUS,
            direction: dbMessage.direction,
            status: MessageStatus.DELIVERED,
            referenceChatId,
            messageId: dbMessage.id,
            date: dbMessage.createdAt,
            message: updatedMessage,
          },
          channelConfigId,
        );
      }

      return;
    }

    if (['rich-card'].includes(payload?.messageType)) {
      const message = {
        ...(payload as RcsMessageRichCardContentDto),
      };

      if (message) {
        const fileName = message.fileUrl.split('/').pop();
        const awsUrl = await this.importMedia(
          message.fileUrl,
          fileName,
          undefined,
        );

        const updatedMessage: RcsMessageRichCardContentDto = {
          ...message,
          fileUrl: awsUrl,
        };

        await this.messageRepository.update(dbMessage.id, {
          rawMessage: updatedMessage,
          status: MessageStatus.DELIVERED,
        });

        await this.notify(
          {
            eventType: SyncEventType.MESSAGE,
            direction: dbMessage.direction,
            status: MessageStatus.DELIVERED,
            referenceChatId,
            messageId: dbMessage.id,
            date: dbMessage.createdAt,
            message: updatedMessage,
          },
          channelConfigId,
        );
      }

      return;
    }

    if (['carousel'].includes(payload?.messageType)) {
      const message = {
        ...(payload as RcsMessageCarouselContentDto),
      };

      if (message) {
        await Promise.all(
          message.items.map(async (item) => {
            const fileName = item.fileUrl.split('/').pop();
            return this.importMedia(item.fileUrl, fileName, undefined).then(
              (awsUrl) => {
                return {
                  ...item,
                  fileUrl: awsUrl,
                };
              },
            );
          }),
        );

        await this.messageRepository.update(dbMessage.id, {
          rawMessage: message,
          status: MessageStatus.DELIVERED,
        });

        await this.notify(
          {
            eventType: SyncEventType.MESSAGE,
            direction: dbMessage.direction,
            status: MessageStatus.DELIVERED,
            referenceChatId,
            messageId: dbMessage.id,
            date: dbMessage.createdAt,
            message: message,
          },
          channelConfigId,
        );
      }

      return;
    }
  }

  private async importMedia(url: string, fileName: string, mimeType?: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(url, {
        responseType: 'arraybuffer',
      }),
    );

    const buffer = Buffer.from(data, 'binary');
    const randomPath = crypto.randomBytes(20).toString('hex');

    const fileKey = `${this.configService.getOrThrow('APP_NAME')}/${randomPath}/${fileName}`;

    return await this.s3Service.upload({
      ACL: 'public-read',
      Bucket: this.configService.getOrThrow('AWS_BUCKET'),
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType,
    });
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
