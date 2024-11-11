import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import {
  BrokerType,
  ChannelType,
  MessageDirection,
  MessageStatus,
} from '@/models/enums';
import { ChatNotReadyException } from '@/models/exceptions/chat-not-ready.exception';
import { MessageContentNotSupportedException } from '@/models/exceptions/message-content-not-supported.exception';
import { MessageNotReadyException } from '@/models/exceptions/message-not-ready.exception';
import { RcsAccountNotFoundException } from '@/models/exceptions/rcs-account-not-found.exception';
import { InboundMessageDto } from '@/models/inbound-message.dto';
import { OutboundMessageDto } from '@/models/outbound-message.dto';
import { RcsInboundMessage } from '@/models/rcs-inbound-message.model';
import { BaseRcsMessageContentDto } from '@/models/rsc-message.dto';
import { SyncEventType } from '@/models/sync-message.model';
import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';
import {
  PontalTechRcsApiRequestMapper,
  PontalTechRcsMessageApiRequest,
} from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs.models';
import { PontalTechSendRcsApiResponse } from '@/modules/brokers/pontal-tech/models/v2/pontal-tech-send-rcs-api-response.model';
import { PontalTechRcsV2IntegrationService } from '@/modules/brokers/pontal-tech/services/pontal-tech-rcs-v2-integration.service';
import { ChatDto } from '@/modules/entity-manager/rcs/models/chat.dto';
import { RcsAccountDto } from '@/modules/entity-manager/rcs/models/rcs-account.dto';
import { ChatService } from '@/modules/entity-manager/rcs/services/chat.service';
import { MessageService } from '@/modules/entity-manager/rcs/services/message.service';
import { RcsAccountService } from '@/modules/entity-manager/rcs/services/rcs-account.service';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';

@Injectable()
export class RcsPontalTechService {
  constructor(
    private readonly pontalTechRcsV2IntegrationService: PontalTechRcsV2IntegrationService,
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
    standard: (
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
  };

  public async outbound(outboundMessageDto: OutboundMessageDto) {
    const { channelConfigId } = outboundMessageDto;

    const account = await this.tryGetAccount(channelConfigId);

    try {
      const [pontalTechMessageType, pontalTechApiModel] =
        PontalTechRcsApiRequestMapper.fromOutboundMessageDto(
          account.pontalTechRcsAccount.pontalTechAccountId,
          outboundMessageDto,
        );

      this.logger.debug(
        [pontalTechMessageType, pontalTechApiModel, outboundMessageDto],
        'sendMessage :: OUTBOUND',
      );

      //TODO validação se o usuário pode ou nao enviar o tipo de mensagem com a conta atual

      const strategy = this.OUTBOUND_STRATEGIES[pontalTechMessageType];

      if (!strategy) {
        this.logger.warn(
          outboundMessageDto,
          'rcsPontalTechHandler :: Message type not supported',
        );

        throw new MessageContentNotSupportedException(
          ChannelType.RCS,
          BrokerType.PONTAL_TECH,
          outboundMessageDto.payload,
        );
      }

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

  public async inbound(inboundMessage: InboundMessageDto) {
    const webhook = inboundMessage.payload as PontalTechWebhookApiRequest;

    this.logger.debug(webhook, 'webhook');

    const chat = await this.getChatOrThrow(webhook);

    const existingMessage = await this.getExistingMessageOrThrow(webhook, chat);

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
      direction:
        existingMessage?.direction ||
        (webhook.direction === 'inbound'
          ? MessageDirection.INBOUND
          : MessageDirection.OUTBOUND),
      message,
      errorMessage,
      rcsAccountId: chat.rcsAccountId,
      status,
      recipient: webhook.user_id,
    };

    this.logger.debug(rcsInboundMessage, 'rcsInboundMessage');
    this.logger.debug(existingMessage, 'existingMessage');

    if (existingMessage) {
      await this.rcsMessageService.syncStatus(
        chat.rcsAccount.referenceId,
        chat.referenceChatId,
        existingMessage,
        rcsInboundMessage,
      );

      return;
    }

    const isReplyingMessage =
      webhook.event_id !== existingMessage?.brokerMessageId;

    if (isReplyingMessage) {
      await this.rcsMessageService.inboundMessage(
        chat.rcsAccount.referenceId,
        rcsInboundMessage,
      );

      return;
    }
  }

  private async getExistingMessageOrThrow(
    webhook: PontalTechWebhookApiRequest,
    chat: ChatDto,
  ) {
    const existingMessage = await this.messageService.getByBrokerMessage(
      webhook.event_id,
      chat.id,
    );

    if (
      !existingMessage &&
      ['single', 'DELIVERED', 'READ', 'EXCEPTION', 'ERROR'].includes(
        webhook.type,
      )
    ) {
      this.logger.error(webhook, 'process :: message not ready');
      throw new MessageNotReadyException(
        webhook.reference,
        BrokerType.PONTAL_TECH,
      );
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

  private async saveOutbound(
    channelConfigId: string,
    dataMessage: { id: string; number: string; session_id: string },
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
  ): Promise<void> {
    return this.rcsMessageService
      .outboundMessage(
        channelConfigId,
        MessageDirection.OUTBOUND,
        MessageStatus.QUEUED,
        dataMessage.number,
        outboundMessageDto.payload,
        {
          referenceChatId: outboundMessageDto.referenceChatId,
          brokerChatId: dataMessage.session_id,
          rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
        },
        dataMessage.id,
      )
      .then((savedMessage) => {
        this.logger.debug(savedMessage, 'sendMessage :: saved message');
      });
  }

  private async saveOutboundError(
    channelConfigId: string,
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
    error: Error,
  ) {
    const dbMessage = await this.rcsMessageService.outboundMessage(
      channelConfigId,
      MessageDirection.OUTBOUND,
      MessageStatus.ERROR,
      outboundMessageDto.recipients.join(','),
      outboundMessageDto.payload,
      {
        referenceChatId: outboundMessageDto.referenceChatId,
        rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
      },
      undefined,
      error.message,
    );

    this.rcsMessageService.notify(
      {
        referenceChatId: outboundMessageDto.referenceChatId,
        date: dbMessage.createdAt,
        direction: MessageDirection.OUTBOUND,
        eventType: SyncEventType.STATUS,
        messageId: dbMessage.id,
        status: MessageStatus.ERROR,
        errorMessage: error.message,
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
    const data = await lastValueFrom(
      this.pontalTechRcsV2IntegrationService.sendRcsSingleMessage(
        pontalTechApiModel,
      ),
    );

    this.logger.debug(
      data,
      'sendMessage(standard) :: Pontal Tech API response',
    );

    await this.processOutboundResponse(
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
    const data = await lastValueFrom(
      this.pontalTechRcsV2IntegrationService.sendRcsBasicMessage(
        pontalTechApiModel,
      ),
    );

    this.logger.debug(data, 'sendMessage(basic) :: Pontal Tech API response');

    await this.processOutboundResponse(
      data,
      channelConfigId,
      outboundMessageDto,
      account,
    );

    return;
  }

  private async processOutboundResponse(
    data: PontalTechSendRcsApiResponse,
    channelConfigId: string,
    outboundMessageDto: OutboundMessageDto,
    account: RcsAccountDto,
  ) {
    await Promise.all(
      data.messages.map((dataMessage) =>
        this.saveOutbound(
          channelConfigId,
          dataMessage,
          outboundMessageDto,
          account,
        ),
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
