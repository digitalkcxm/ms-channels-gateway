import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { BrokerType, MessageDirection, MessageStatus } from '@/models/enums';
import { RcsAccountNotFoundException } from '@/models/exceptions/rcs-account-not-found.exception';
import { InboundMessage } from '@/models/inbound-message.model';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { PontalTechRcsIntegrationService } from '@/modules/brokers/pontal-tech/pontal-tech-rcs-integration.service';
import {
  PontalTechRcsApiRequestMapper,
  PontalTechWebhookApiRequest,
  PontalTechWebhookType,
} from '@/modules/brokers/pontal-tech/pontal-tech-rcs.models';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';
import { RcsAccountService } from '@/modules/entity-manager/rcs/services/rcs-account.service';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';
import { SyncEventType } from '@/models/sync-message.model';
import { ChatNotFoundException } from '@/models/exceptions/chat-not-found.exception';
import { OutboundMessageDto } from '@/models/outbound-message.model';

const TYPE_TO_STATUS: {
  [key in PontalTechWebhookType]: MessageStatus;
} = {
  audio: MessageStatus.DELIVERED,
  carousel: MessageStatus.DELIVERED,
  contact: MessageStatus.DELIVERED,
  document: MessageStatus.DELIVERED,
  image: MessageStatus.DELIVERED,
  location: MessageStatus.DELIVERED,
  richCard: MessageStatus.DELIVERED,
  text: MessageStatus.DELIVERED,
  video: MessageStatus.DELIVERED,
  'bloqueado por duplicidade': MessageStatus.ERROR,
  DELIVERED: MessageStatus.DELIVERED,
  READ: MessageStatus.READ,
  EXCEPTION: MessageStatus.ERROR,
} as const;

@Injectable()
export class RcsPontalTechService {
  constructor(
    private readonly pontalTechRcsIntegrationService: PontalTechRcsIntegrationService,
    private readonly rcsMessageService: RcsMessageService,
    private readonly rcsAccountService: RcsAccountService,

    private readonly chatService: ChatService,
    private readonly messageRepository: MessageRepository,
  ) {}

  private readonly logger = new Logger(RcsPontalTechService.name);

  public async sendMessage(message: OutboundMessageDto) {
    try {
      const { channelConfigId } = message;

      const account = await this.rcsAccountService.getByReference(
        channelConfigId,
        BrokerType.PONTAL_TECH,
      );

      if (!account?.pontalTechRcsAccount?.pontalTechAccountId) {
        throw new RcsAccountNotFoundException(
          channelConfigId,
          BrokerType.PONTAL_TECH,
        );
      }

      const [isValid, pontalTechMessageType, pontalTechApiModel, errorMessage] =
        PontalTechRcsApiRequestMapper.fromOutboundMessageDto(
          account.pontalTechRcsAccount.pontalTechAccountId,
          message,
        );

      this.logger.debug(
        [
          isValid,
          pontalTechMessageType,
          pontalTechApiModel,
          errorMessage,
          message,
        ],
        'sendMessage :: OUTBOUND',
      );

      if (!isValid) {
        const dbMessage = await this.rcsMessageService.outboundMessage(
          channelConfigId,
          MessageDirection.OUTBOUND,
          MessageStatus.ERROR,
          message.recipients.join(','),
          message.payload,
          {
            id: message.chatId,
            rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
          },
          undefined,
          errorMessage,
        );

        this.rcsMessageService.notify(
          {
            chatId: message.chatId,
            date: dbMessage.createdAt,
            direction: MessageDirection.OUTBOUND,
            eventType: SyncEventType.STATUS,
            messageId: dbMessage.id,
            status: MessageStatus.ERROR,
            errorMessage,
          },
          channelConfigId,
        );
      }

      //TODO validaçao se o usuario pode ou nao enviar o tipo de mensagem com a conta atual

      if (pontalTechMessageType === 'basic') {
        const data = await lastValueFrom(
          this.pontalTechRcsIntegrationService.sendRcsBasicMessage(
            pontalTechApiModel,
          ),
        );

        this.logger.debug(
          data,
          'sendMessage(basic) :: Pontal Tech API response',
        );

        await Promise.all(
          data.messages.map((dataMessage) =>
            this.rcsMessageService
              .outboundMessage(
                channelConfigId,
                MessageDirection.OUTBOUND,
                MessageStatus.QUEUED,
                dataMessage.number,
                message.payload,
                {
                  id: message.chatId,
                  brokerChatId: dataMessage.session_id,
                  rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
                },
                dataMessage.id,
              )
              .then((savedMessage) => {
                this.logger.debug(savedMessage, 'sendMessage :: saved message');
              }),
          ),
        );

        return;
      }

      if (pontalTechMessageType === 'standard') {
        const data = await lastValueFrom(
          this.pontalTechRcsIntegrationService.sendRcsSingleMessage(
            pontalTechApiModel,
          ),
        );

        this.logger.debug(
          data,
          'sendMessage(standard) :: Pontal Tech API response',
        );

        await Promise.all(
          data.messages.map((dataMessage) =>
            this.rcsMessageService
              .outboundMessage(
                channelConfigId,
                MessageDirection.OUTBOUND,
                MessageStatus.QUEUED,
                dataMessage.number,
                message.payload,
                {
                  id: message.chatId,
                  brokerChatId: dataMessage.session_id,
                  rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
                },
                dataMessage.id,
              )
              .then((savedMessage) => {
                this.logger.debug(savedMessage, 'sendMessage :: saved message');
              }),
          ),
        );

        return;
      }

      this.logger.warn(
        message,
        'rcsPontalTechHandler :: Message type not supported',
      );
    } catch (error) {
      this.logger.error(error, 'sendMessage');
      this.logger.debug(message, 'sendMessage :: error :: message');

      throw error;
    }
  }

  public async receiveMessage(inboundMessage: InboundMessage) {
    const webhook = inboundMessage.payload as PontalTechWebhookApiRequest;

    const chat = await this.chatService.getByBrokerChat(
      webhook.reference,
      true,
    );

    if (!chat) {
      this.logger.error(webhook, 'process :: chat not found');
      throw new ChatNotFoundException(
        webhook.reference,
        BrokerType.PONTAL_TECH,
      );
    }

    const status = TYPE_TO_STATUS[webhook.type] || MessageStatus.ERROR;

    const getMessage = (
      webhook: PontalTechWebhookApiRequest,
      status: MessageStatus,
    ) => {
      if (status === MessageStatus.ERROR) {
        if (webhook.type === 'EXCEPTION') {
          return webhook.message;
        }

        if (webhook.type === 'bloqueado por duplicidade') {
          return 'Duplicate message';
        }
      }

      return {
        type: webhook.type,
        [webhook.type]: webhook.message?.[webhook.type] || webhook.message,
      };
    };

    const existingMessage = await this.messageRepository.getBy({
      brokerMessageId: webhook.event_id,
      chatId: chat.id,
    });

    this.logger.debug(webhook, 'webhook');

    const message: RcsInboundMessage = {
      brokerChatId: webhook.reference,
      brokerMessageId: webhook.event_id,
      direction:
        webhook.direction === 'inbound'
          ? MessageDirection.INBOUND
          : MessageDirection.OUTBOUND,
      message: getMessage(webhook, status),
      rcsAccountId: chat.rcsAccountId,
      status,
      recipient: webhook.user_id,
    };

    this.logger.debug(message, 'message');

    if (existingMessage) {
      await this.rcsMessageService.syncStatus(
        chat.rcsAccount.referenceId,
        existingMessage,
        message,
      );

      return;
    }

    const isReplyingMessage =
      webhook.event_id !== existingMessage?.brokerMessageId;

    if (isReplyingMessage) {
      await this.rcsMessageService.replyMessage(
        chat.rcsAccount.referenceId,
        message,
      );

      return;
    }
  }
}
