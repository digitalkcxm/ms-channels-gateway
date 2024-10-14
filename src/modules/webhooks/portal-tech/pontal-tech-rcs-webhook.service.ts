import { Injectable, Logger } from '@nestjs/common';

import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/pontal-tech-rcs.models';
import {
  MessageDirection,
  MessageStatus,
} from '@/modules/database/rcs/entities/enums';
import { ChatRepository } from '@/modules/database/rcs/repositories/chat.repository';
import { MessageRepository } from '@/modules/database/rcs/repositories/message.repository';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';

const TYPE_TO_STATUS = {
  text: MessageStatus.SENT,
  DELIVERED: MessageStatus.DELIVERED,
  READ: MessageStatus.READ,
} as const;

@Injectable()
export class PontalTechRcsWebhookService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly rcsMessageService: RcsMessageService,
  ) {}

  private readonly logger = new Logger(PontalTechRcsWebhookService.name);

  public async inboundMessage(webhook: PontalTechWebhookApiRequest) {
    // TODO: get from cache
    const chat = await this.chatRepository.getByBrokerChat(
      webhook.reference,
      true,
    );

    if (!chat) {
      this.logger.error(
        webhook,
        'PontalTechRcsWebhookController :: webhook :: chat not found',
      );
      return;
    }

    const status = TYPE_TO_STATUS[webhook.type] || MessageStatus.ERROR;

    const message: RcsInboundMessage = {
      brokerChatId: webhook.reference,
      brokerMessageId: webhook.event_id,
      direction:
        webhook.direction === 'inbound'
          ? MessageDirection.INBOUND
          : MessageDirection.OUTBOUND,
      message: webhook.message,
      rcsAccountId: chat.rcsAccountId,
      status,
    };

    const existingMessage = await this.messageRepository.getByChat(chat.id);

    this.logger.debug(webhook, 'PontalTechRcsWebhookController :: webhook');
    this.logger.debug(
      existingMessage,
      'PontalTechRcsWebhookController :: existingMessage',
    );

    //TODO verificar se é uma resposta e fazer um fluxo especifico
    const isReplyingMessage =
      webhook.event_id !== existingMessage?.brokerMessageId;

    this.logger.debug(
      isReplyingMessage,
      'PontalTechRcsWebhookController :: isReplyingMessage',
    );

    if (existingMessage) {
      await this.rcsMessageService.syncStatus(
        chat.rcsAccount.referenceId,
        existingMessage,
        message,
      );
    } else {
      await this.rcsMessageService.inboundMessage(
        chat.rcsAccount.referenceId,
        message,
      );
    }
  }
}
