import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import * as crypto from 'node:crypto';

import { BrokerType, MessageDirection, MessageStatus } from '@/models/enums';
import { ChatNotReadyException } from '@/models/exceptions/chat-not-ready.exception';
import { MessageNotReadyException } from '@/models/exceptions/message-not-ready.exception';
import { RcsAccountNotFoundException } from '@/models/exceptions/rcs-account-not-found.exception';
import { InboundMessageDto } from '@/models/inbound-message.dto';
import { OutboundMessageDto } from '@/models/outbound-message.dto';
import { BaseRcsMessageContentDto } from '@/models/rcs/base-rcs-message-content.dto';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { SyncEventType } from '@/models/sync-message.model';
import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';
import {
  PontalTechRcsApiRequestMapper,
  PontalTechRcsMessageApiRequest,
} from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs.models';
import { PontalTechRcsV3IntegrationService } from '@/modules/brokers/pontal-tech/v3/pontal-tech-rcs-v3-integration.service';
import { PontalTechSendRcsApiResponse } from '@/modules/brokers/pontal-tech/v3/pontal-tech-send-rcs-api-response.model';
import { RcsAccountDto } from '@/modules/entity-manager/rcs/models/rcs-account.dto';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';
import { MessageService } from '@/modules/entity-manager/rcs/services/message.service';
import { RcsAccountService } from '@/modules/entity-manager/rcs/services/rcs-account.service';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';

@Injectable()
export class RcsPontalTechService {
  constructor(
    private readonly pontalTechRcsV3IntegrationService: PontalTechRcsV3IntegrationService,
    private readonly rcsMessageService: RcsMessageService,
    private readonly rcsAccountService: RcsAccountService,

    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  private readonly logger = new Logger(RcsPontalTechService.name);

  private OUTBOUND_STRATEGIES = {
    basic: (
      pontalTechApiModel: PontalTechRcsMessageApiRequest,
      channelConfigId: string,
      outboundMessageDto: OutboundMessageDto,
      account: RcsAccountDto,
    ) =>
      this.sendBasic(
        pontalTechApiModel,
        channelConfigId,
        outboundMessageDto,
        account,
      ),
    single: (
      pontalTechApiModel: PontalTechRcsMessageApiRequest,
      channelConfigId: string,
      outboundMessageDto: OutboundMessageDto,
      account: RcsAccountDto,
    ) =>
      this.sendStandard(
        pontalTechApiModel,
        channelConfigId,
        outboundMessageDto,
        account,
      ),
    'conversational-webhook': (
      pontalTechApiModel: PontalTechRcsMessageApiRequest,
      channelConfigId: string,
      outboundMessageDto: OutboundMessageDto,
      account: RcsAccountDto,
    ) =>
      this.sendConversationalWebhook(
        pontalTechApiModel,
        channelConfigId,
        outboundMessageDto,
        account,
      ),
  };

  public async outbound(outboundMessageDto: OutboundMessageDto) {
    const { channelConfigId } = outboundMessageDto;

    const account = await this.tryGetAccount(channelConfigId);

    try {
      const pontalTechApiModel =
        PontalTechRcsApiRequestMapper.fromOutboundMessageDto(
          account.pontalTechRcsAccount.pontalTechAccountId,
          outboundMessageDto,
        );

      this.logger.debug(
        [
          account.pontalTechRcsAccount?.pontalTechAccountType,
          pontalTechApiModel,
          outboundMessageDto,
        ],
        'sendMessage :: OUTBOUND',
      );

      const strategy =
        this.OUTBOUND_STRATEGIES[
          account.pontalTechRcsAccount?.pontalTechAccountType
        ];

      await strategy(
        pontalTechApiModel,
        channelConfigId,
        outboundMessageDto,
        account,
      );
    } catch (error) {
      return await this.saveOutboundError(
        channelConfigId,
        outboundMessageDto,
        account,
        error,
      );
    }
  }

  public async outboundStatus(inboundMessage: InboundMessageDto) {
    const webhook = inboundMessage.payload as PontalTechWebhookApiRequest;

    this.logger.debug(webhook, 'outboundStatus :: webhook');

    const chat = await this.getChatOrThrow(webhook);

    const status =
      BaseRcsMessageContentDto.extractStatusFromPontalTechRcsWebhookApiRequest(
        webhook,
      );

    const message =
      BaseRcsMessageContentDto.fromPontalTechRcsWebhookApiRequest(webhook);

    const errorMessage =
      BaseRcsMessageContentDto.extractErrorFromPontalTechRcsWebhookApiRequest(
        webhook,
      );

    const rcsInboundMessage: RcsInboundMessage = {
      brokerChatId: webhook.reference,
      brokerMessageId: webhook.event_id,
      direction: MessageDirection.OUTBOUND,
      message,
      errorMessage,
      rcsAccountId: chat.rcsAccountId,
      status,
      recipient: webhook.user_id,
    };

    this.logger.debug(rcsInboundMessage, 'rcsInboundMessage');

    const existingMessage = await this.getExistingMessageOrThrow(
      inboundMessage.payload.reference,
      webhook,
    );

    this.logger.debug(existingMessage, 'existingMessage');

    return await this.rcsMessageService.syncStatus(
      chat.rcsAccount.referenceId,
      chat.referenceChatId,
      existingMessage,
      rcsInboundMessage,
    );
  }

  public async inbound(inboundMessage: InboundMessageDto) {
    const webhook = inboundMessage.payload as PontalTechWebhookApiRequest;

    this.logger.debug(webhook, 'inbound :: webhook');

    const originMessage = await this.messageService.getLastMessageByRecipient(
      inboundMessage.payload.user_id,
    );

    const status =
      BaseRcsMessageContentDto.extractStatusFromPontalTechRcsWebhookApiRequest(
        webhook,
      );

    const message =
      BaseRcsMessageContentDto.fromPontalTechRcsWebhookApiRequest(webhook);

    const errorMessage =
      BaseRcsMessageContentDto.extractErrorFromPontalTechRcsWebhookApiRequest(
        webhook,
      );

    const rcsInboundMessage: RcsInboundMessage = {
      brokerChatId: originMessage.chat.brokerChatId,
      brokerMessageId: webhook.event_id,
      direction: MessageDirection.INBOUND,
      message,
      errorMessage,
      rcsAccountId: originMessage.chat.rcsAccountId,
      status,
      recipient: webhook.user_id,
    };

    this.logger.debug(rcsInboundMessage, 'rcsInboundMessage');

    return await this.rcsMessageService.inboundMessage(
      originMessage.chat.rcsAccount.referenceId,
      rcsInboundMessage,
    );
  }

  private async getExistingMessageOrThrow(
    reference: string,
    webhook: PontalTechWebhookApiRequest,
  ) {
    const existingMessage =
      await this.messageService.getByOutboundBrokerMessage(reference);

    if (
      !existingMessage &&
      [
        'basic',
        'single',
        'conversacional',
        'DELIVERED',
        'READ',
        'EXCEPTION',
        'ERROR',
      ].includes(webhook.type)
    ) {
      this.logger.error(webhook, 'process :: message not ready');
      throw new MessageNotReadyException(reference, BrokerType.PONTAL_TECH);
    }

    return existingMessage;
  }

  private async getChatOrThrow(webhook: PontalTechWebhookApiRequest) {
    const chat = await this.chatService.getByBrokerChat(
      webhook.reference,
      true,
    );

    if (!chat) {
      this.logger.error(webhook, 'process :: chat not ready');
      throw new ChatNotReadyException(
        webhook.reference,
        BrokerType.PONTAL_TECH,
      );
    }

    return chat;
  }

  private async saveOutboundError(
    channelConfigId: string,
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
    error: Error,
  ) {
    const dbMessage = await this.rcsMessageService.saveMessage(
      channelConfigId,
      MessageDirection.OUTBOUND,
      MessageStatus.ERROR,
      outboundMessageDto.recipients.join(','),
      outboundMessageDto.payload,
      {
        referenceChatId: outboundMessageDto.referenceChatId,
        rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
        brokerChatId: crypto.randomUUID({ disableEntropyCache: true }),
      },
      undefined,
      undefined,
      outboundMessageDto.referenceMessageId,
      error.message,
    );

    await this.rcsMessageService.notify(
      {
        referenceChatId: outboundMessageDto.referenceChatId,
        referenceMessageId: outboundMessageDto.referenceMessageId,
        date: dbMessage.createdAt,
        direction: MessageDirection.OUTBOUND,
        eventType: SyncEventType.STATUS,
        messageId: dbMessage.id,
        status: MessageStatus.ERROR,
        errorMessage: error.message,
        contact: dbMessage.recipient,
      },
      channelConfigId,
    );

    return;
  }

  private async sendStandard(
    pontalTechApiModel: PontalTechRcsMessageApiRequest,
    channelConfigId: string,
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
  ) {
    const messageId = crypto.randomUUID({ disableEntropyCache: true });

    const data = await lastValueFrom(
      this.pontalTechRcsV3IntegrationService.sendRcsSingleMessage(
        account.pontalTechRcsAccount?.apiKey,
        pontalTechApiModel,
      ),
    );

    this.logger.debug(
      data,
      'sendMessage(standard) :: Pontal Tech API response',
    );

    await this.processOutboundResponse(
      messageId,
      data,
      channelConfigId,
      outboundMessageDto,
      account,
    );

    return;
  }

  private async sendBasic(
    pontalTechApiModel: PontalTechRcsMessageApiRequest,
    channelConfigId: string,
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
  ) {
    const messageId = crypto.randomUUID({ disableEntropyCache: true });

    const data = await lastValueFrom(
      this.pontalTechRcsV3IntegrationService.sendRcsBasicMessage(
        account.pontalTechRcsAccount?.apiKey,
        pontalTechApiModel,
      ),
    );

    this.logger.debug(data, 'sendMessage(basic) :: Pontal Tech API response');

    await this.processOutboundResponse(
      messageId,
      data,
      channelConfigId,
      outboundMessageDto,
      account,
    );

    return;
  }

  private async sendConversationalWebhook(
    pontalTechApiModel: PontalTechRcsMessageApiRequest,
    channelConfigId: string,
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
  ) {
    const messageId = crypto.randomUUID({ disableEntropyCache: true });

    const data = await lastValueFrom(
      this.pontalTechRcsV3IntegrationService.sendRcsConversationalWebhook(
        account.pontalTechRcsAccount?.apiKey,
        pontalTechApiModel,
      ),
    );

    this.logger.debug(
      data,
      'sendMessage(standard) :: Pontal Tech API response',
    );

    await this.processOutboundResponse(
      messageId,
      data,
      channelConfigId,
      outboundMessageDto,
      account,
    );

    return;
  }

  private async processOutboundResponse(
    messageId: string,
    data: PontalTechSendRcsApiResponse,
    channelConfigId: string,
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
  ) {
    await Promise.all(
      data.validMessages.map((dataMessage) =>
        this.rcsMessageService
          .saveMessage(
            channelConfigId,
            MessageDirection.OUTBOUND,
            MessageStatus.QUEUED,
            dataMessage.number,
            outboundMessageDto.payload,
            {
              referenceChatId: outboundMessageDto.referenceChatId,
              brokerChatId: dataMessage.id,
              rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
            },
            messageId,
            dataMessage.id,
            outboundMessageDto.referenceMessageId,
          )
          .then((savedMessage) => {
            this.logger.debug(savedMessage, 'saveOutbound');
          }),
      ),
    );
  }

  private async tryGetAccount(channelConfigId: string) {
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

    return account;
  }
}
