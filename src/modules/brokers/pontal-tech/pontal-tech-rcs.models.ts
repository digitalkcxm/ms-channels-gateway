import { OutboundMessageDto } from '@/models/outbound-message.model';
import {
  RcsOutboundMessageCarouselContentDto,
  RcsOutboundMessageDto,
  RcsOutboundMessageImageContentDto,
  RcsOutboundMessagePdfContentDto,
  RcsOutboundMessageRichCardContentDto,
  RcsOutboundMessageTextContentDto,
  RcsOutboundMessageType,
  RcsOutboundMessageVideoContentDto,
} from '@/models/rsc-outbound-message.dto';

export type PontalTechRcsMessageTextContent = {
  text: {
    message: string;
  };
};

export type PontalTechRcsMessageImageContent = {
  image: {
    url: string;
  };
};

export type PontalTechRcsMessageVideoContent = {
  video: {
    url: string;
  };
};

export type PontalTechRcsMessagePdfContent = {
  pdf: {
    url: string;
  };
};

export type PontalTechRcsMessageSuggestion = {
  type: 'openUrl' | 'call' | 'reply';
  title: string;
  value: string;
};

export type PontalTechRcsMessageRichCardContent = {
  richCard: {
    title: string;
    description?: string; // Max. 2000 characters
    fileUrl: string;
    suggestions?: PontalTechRcsMessageSuggestion[];
  };
};

export type PontalTechRcsMessageCarouselContent = {
  carousel: {
    title: string;
    description?: string;
    fileUrl: string;
    suggestions?: PontalTechRcsMessageSuggestion[];
    forceRefresh?: boolean;
  }[];
};

type PontalTechRcsBasicContent = PontalTechRcsMessageTextContent;

export type PontalTechRcsMessageContentsAll =
  | PontalTechRcsMessageTextContent
  | PontalTechRcsMessageImageContent
  | PontalTechRcsMessageVideoContent
  | PontalTechRcsMessagePdfContent
  | PontalTechRcsMessageRichCardContent
  | PontalTechRcsMessageCarouselContent;

export type PontalTechRcsSingleContent = PontalTechRcsMessageContentsAll;

export type PontalTechRcsMessageApiRequest = {
  account: string;
  messages: {
    number: string;
    vars?: {
      [key: string]: string;
    };
  }[];
  content: PontalTechRcsBasicContent | PontalTechRcsSingleContent;
};

export type PontalTechSendRcsApiResponse = {
  campaign_id: string;
  messages: {
    id: string;
    number: string;
    session_id: string;
  }[];
};

export type PontalTechWebhookDirection = 'inbound' | 'outbound';

export type PontalTechWebhookType =
  | 'audio'
  | 'carousel'
  | 'contact'
  | 'document'
  | 'image'
  | 'location'
  | 'richCard'
  | 'text'
  | 'video'
  | 'bloqueado por duplicidade'
  | 'DELIVERED'
  | 'READ'
  | 'EXCEPTION';

export type PontalTechWebhookContentType =
  | 'text'
  | 'image'
  | 'video'
  | 'pdf'
  | 'richCard'
  | 'carousel';

export type PontalTechWebhookMessageType = {
  contentType?: PontalTechWebhookContentType;
} & {
  [key in PontalTechWebhookContentType]: any;
};

export type PontalTechWebhookApiRequest = {
  reference: string;
  event_id: string;
  direction: PontalTechWebhookDirection;
  user_id: string;
  timestamp: Date;
  channel: string;
  type: PontalTechWebhookType;
  message?: PontalTechWebhookMessageType;
  vars?: { [propName: string]: string };
};

export class PontalTechRcsApiRequestMapper {
  public static fromOutboundMessageDto(
    account: string,
    dto: OutboundMessageDto,
  ): [
    isValid: boolean,
    type?: string,
    model?: PontalTechRcsMessageApiRequest,
    errorMessage?: string,
  ] {
    const { recipients, payload } = dto;

    if (payload as RcsOutboundMessageDto) {
      const content =
        PontalTechRcsApiRequestMapper.parseOutboundContent(payload);

      if (!content) {
        return [false, null, null, 'Content can not be parsed'];
      }

      const type =
        !(payload.content as RcsOutboundMessageTextContentDto) ||
        (payload.content as RcsOutboundMessageTextContentDto).text.length > 160
          ? 'standard'
          : 'basic';

      return [
        true,
        type,
        {
          account,
          messages: recipients.map((number) => ({
            number,
          })),
          content,
        },
      ];
    }

    return [false, null, null, 'Content can not be parsed'];
  }

  static DTO_TO_CONTENT_MAP: {
    [messageType in RcsOutboundMessageType]: (
      payload: RcsOutboundMessageDto,
    ) => PontalTechRcsMessageContentsAll;
  } = {
    carousel: (payload: RcsOutboundMessageDto) => {
      const content = payload.content as RcsOutboundMessageCarouselContentDto;
      return {
        carousel: content?.items?.map((item) => ({
          title: item.title,
          fileUrl: item.fileUrl,
          description: item.description,
        })),
      };
    },
    image: (payload: RcsOutboundMessageDto) => {
      const content = payload.content as RcsOutboundMessageImageContentDto;
      return {
        image: {
          url: content.url,
        },
      };
    },
    pdf: (payload: RcsOutboundMessageDto) => {
      const content = payload.content as RcsOutboundMessagePdfContentDto;
      return {
        pdf: {
          url: content.url,
        },
      };
    },
    text: (payload: RcsOutboundMessageDto) => {
      const content = payload.content as RcsOutboundMessageTextContentDto;
      return {
        text: {
          message: content.text,
        },
      };
    },
    video: (payload: RcsOutboundMessageDto) => {
      const content = payload.content as RcsOutboundMessageVideoContentDto;
      return {
        video: {
          url: content.url,
        },
      };
    },
    'rich-card': (payload: RcsOutboundMessageDto) => {
      const content = payload.content as RcsOutboundMessageRichCardContentDto;
      return {
        richCard: {
          title: content.title,
          description: content.description,
          fileUrl: content.fileUrl,
        },
      };
    },
  } as const;

  private static parseOutboundContent(payload: RcsOutboundMessageDto) {
    return PontalTechRcsApiRequestMapper.DTO_TO_CONTENT_MAP[
      payload.content.messageType
    ](payload);
  }
}
