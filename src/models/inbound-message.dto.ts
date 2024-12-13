import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';

import { BrokerType, ChannelType } from './enums';
import {
  RcsMessageActionCallbackDto,
  RcsMessageActionContentDto,
} from './rcs/rcs-message-action.dto';
import { RcsMessageDocumentContentDto } from './rcs/rcs-message-document-content.dto';
import {
  RcsMessageAudioContentDto,
  RcsMessageCarouselContentDto,
  RcsMessageImageContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageVideoContentDto,
} from './rcs/rsc-message.dto';

export type InboundMessageDto = {
  broker: BrokerType;
  channel: ChannelType;
  messageId: string;
  payload: PontalTechWebhookApiRequest;
};

export type InboundMediaMessageDto = {
  brokerMessageId: string;
  chatId: string;
  referenceChatId: string;
  channelConfigId: string;
  payload:
    | RcsMessageActionContentDto
    | RcsMessageActionCallbackDto
    | RcsMessageAudioContentDto
    | RcsMessageCarouselContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageImageContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto;
};
