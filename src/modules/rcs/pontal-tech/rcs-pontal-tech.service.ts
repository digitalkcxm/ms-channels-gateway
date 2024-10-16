import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { BrokerType, MessageDirection, MessageStatus } from '@/models/enums';
import { RcsAccountNotFoundException } from '@/models/exceptions/rcs-account-not-found.exception';
import { InboundMessage } from '@/models/inbound-message.model';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { RcsMessageModel } from '@/models/rsc-message.model';
import { PontalTechRcsIntegrationService } from '@/modules/brokers/pontal-tech/pontal-tech-rcs-integration.service';
import {
  PontalTechRcsApiRequestMapper,
  PontalTechWebhookApiRequest,
} from '@/modules/brokers/pontal-tech/pontal-tech-rcs.models';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';
import { RcsAccountService } from '@/modules/entity-manager/rcs/services/rcs-account.service';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';

const TYPE_TO_STATUS = {
  text: MessageStatus.SENT,
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

  public async sendMessage(message: RcsMessageModel) {
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

      const [type, model] = PontalTechRcsApiRequestMapper.fromMessageModel(
        account.pontalTechRcsAccount.pontalTechAccountId,
        message,
      );

      this.logger.debug(model, 'sendMessage :: OUTBOUND');

      //TODO
      //validaçao se o usuario pode ou nao enviar o tipo de mensagem com a conta atual

      try {
        if (type === 'basic') {
          const data = await lastValueFrom(
            this.pontalTechRcsIntegrationService.sendRcsBasicMessage(model),
          );

          this.logger.debug(data, 'sendMessage :: Pontal Tech API response');

          await Promise.all(
            data.messages.map((dataMessage) =>
              this.rcsMessageService
                .outboundMessage(
                  channelConfigId,
                  MessageDirection.OUTBOUND,
                  MessageStatus.QUEUED,
                  message,
                  {
                    id: message.chatId,
                    brokerChatId: dataMessage.session_id,
                    rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
                  },
                  dataMessage.id,
                )
                .then((savedMessage) => {
                  this.logger.debug(
                    savedMessage,
                    'sendMessage :: saved message',
                  );
                }),
            ),
          );

          return;
        }

        if (type === 'standard') {
          const data = await lastValueFrom(
            this.pontalTechRcsIntegrationService.sendRcsSingleMessage(model),
          );

          this.logger.log(data, 'rcsPontalTechHandler :: data');

          return;
        }

        this.logger.warn(
          message,
          'rcsPontalTechHandler :: Message type not supported',
        );
      } catch (error) {
        this.logger.error(error, 'sendMessage');

        await this.rcsMessageService.outboundMessage(
          channelConfigId,
          MessageDirection.OUTBOUND,
          MessageStatus.ERROR,
          message,
          {
            id: message.chatId,
            rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
          },
          undefined,
          error.message,
        );
      }
    } catch (error) {
      this.logger.error(error, 'rcsPontalTechHandler');
      this.logger.debug(message, 'rcsPontalTechHandler :: error :: message');

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
      return;
    }

    const status = TYPE_TO_STATUS[webhook.type] || MessageStatus.ERROR;

    const existingMessage = await this.messageRepository.getBy({
      brokerMessageId: webhook.event_id,
      chatId: chat.id,
    });

    this.logger.debug(webhook, 'webhook');

    const isError = status === MessageStatus.ERROR;

    const message: RcsInboundMessage = {
      brokerChatId: webhook.reference,
      brokerMessageId: webhook.event_id,
      direction:
        webhook.direction === 'inbound'
          ? MessageDirection.INBOUND
          : MessageDirection.OUTBOUND,
      message: isError
        ? webhook.message
        : {
            type: webhook?.message?.contentType,
            [webhook.message?.contentType]:
              webhook?.message?.[webhook?.message?.contentType],
          },
      rcsAccountId: chat.rcsAccountId,
      status,
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
