import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';

import { BrokerType, ChannelType } from './enums';
import {
  RcsMessageAudioContentDto,
  RcsMessageCarouselContentDto,
  RcsMessageDocumentContentDto,
  RcsMessageImageContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageVideoContentDto,
} from './rsc-message.dto';

export type InboundMessage = {
  broker: BrokerType;
  channel: ChannelType;
  payload: PontalTechWebhookApiRequest;
};

export type InboundMediaMessage = {
  brokerMessageId: string;
  chatId: string;
  referenceChatId: string;
  channelConfigId: string;
  payload:
    | RcsMessageAudioContentDto
    | RcsMessageCarouselContentDto
    | RcsMessageDocumentContentDto
    | RcsMessageImageContentDto
    | RcsMessageRichCardContentDto
    | RcsMessageTextContentDto
    | RcsMessageVideoContentDto;
};
