import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { BrokerType, MessageDirection, MessageStatus } from '@/models/enums';
import { RcsAccountNotFoundException } from '@/models/exceptions/rcs-account-not-found.exception';
import { InboundMessage } from '@/models/inbound-message.model';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { PontalTechRcsV2IntegrationService } from '@/modules/brokers/pontal-tech/services/pontal-tech-rcs-v2-integration.service';
import { PontalTechRcsApiRequestMapper } from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs.models';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';
import { RcsAccountService } from '@/modules/entity-manager/rcs/services/rcs-account.service';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';
import { SyncEventType } from '@/models/sync-message.model';
import { ChatNotFoundException } from '@/models/exceptions/chat-not-found.exception';
import { OutboundMessageDto } from '@/models/outbound-message.model';
import {
  PontalTechWebhookApiRequest,
  PontalTechRcsWebhookType,
} from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';
import { BaseRcsMessageContentDto } from '@/models/rsc-message.dto';

const TYPE_TO_STATUS: {
  [key in PontalTechRcsWebhookType]: MessageStatus;
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
  single: MessageStatus.DELIVERED,
  DELIVERED: MessageStatus.DELIVERED,
  READ: MessageStatus.READ,
  EXCEPTION: MessageStatus.ERROR,
  ERROR: MessageStatus.ERROR,
} as const;

@Injectable()
export class RcsPontalTechService {
  constructor(
    private readonly pontalTechRcsV2IntegrationService: PontalTechRcsV2IntegrationService,
    private readonly rcsMessageService: RcsMessageService,
    private readonly rcsAccountService: RcsAccountService,

    private readonly chatService: ChatService,
    private readonly messageRepository: MessageRepository,
  ) {}

  private readonly logger = new Logger(RcsPontalTechService.name);

  public async outbound(outboundMessageDto: OutboundMessageDto) {
    try {
      const { channelConfigId } = outboundMessageDto;

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
          outboundMessageDto,
        );

      this.logger.debug(
        [
          isValid,
          pontalTechMessageType,
          pontalTechApiModel,
          errorMessage,
          outboundMessageDto,
        ],
        'sendMessage :: OUTBOUND',
      );

      if (!isValid) {
        const dbMessage = await this.rcsMessageService.outboundMessage(
          channelConfigId,
          MessageDirection.OUTBOUND,
          MessageStatus.ERROR,
          outboundMessageDto.recipients.join(','),
          outboundMessageDto.payload,
          {
            id: outboundMessageDto.chatId,
            rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
          },
          undefined,
          errorMessage,
        );

        this.rcsMessageService.notify(
          {
            chatId: outboundMessageDto.chatId,
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
          this.pontalTechRcsV2IntegrationService.sendRcsBasicMessage(
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
                outboundMessageDto.payload,
                {
                  id: outboundMessageDto.chatId,
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
          this.pontalTechRcsV2IntegrationService.sendRcsSingleMessage(
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
                outboundMessageDto.payload,
                {
                  id: outboundMessageDto.chatId,
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
        outboundMessageDto,
        'rcsPontalTechHandler :: Message type not supported',
      );
    } catch (error) {
      this.logger.error(error, 'sendMessage');
      this.logger.debug(outboundMessageDto, 'sendMessage :: error :: message');

      throw error;
    }
  }

  public async inbound(inboundMessage: InboundMessage) {
    const webhook = inboundMessage.payload as PontalTechWebhookApiRequest;

    this.logger.debug(webhook, 'webhook');

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

    const status =
      (webhook.status !== 'bloqueado por duplicidade' &&
        TYPE_TO_STATUS[webhook.type]) ||
      MessageStatus.ERROR;

    const message =
      BaseRcsMessageContentDto.fromPontalTechRcsWebhookApiRequest(webhook);

    this.logger.debug(message, 'message');

    const existingMessage = await this.messageRepository.getBy({
      brokerMessageId: webhook.event_id,
      chatId: chat.id,
    });

    const rcsInboundMessage: RcsInboundMessage = {
      brokerChatId: webhook.reference,
      brokerMessageId: webhook.event_id,
      direction:
        webhook.direction === 'inbound'
          ? MessageDirection.INBOUND
          : MessageDirection.OUTBOUND,
      message,
      rcsAccountId: chat.rcsAccountId,
      status,
      recipient: webhook.user_id,
    };

    this.logger.debug(rcsInboundMessage, 'rcsInboundMessage');

    if (existingMessage) {
      await this.rcsMessageService.syncStatus(
        chat.rcsAccount.referenceId,
        existingMessage,
        rcsInboundMessage,
      );

      return;
    }

    const isReplyingMessage =
      webhook.event_id !== existingMessage?.brokerMessageId;

    if (isReplyingMessage) {
      await this.rcsMessageService.replyMessage(
        chat.rcsAccount.referenceId,
        rcsInboundMessage,
      );

      return;
    }
  }
}
