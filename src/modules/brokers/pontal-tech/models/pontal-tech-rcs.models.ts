import { OutboundMessageDto } from '@/models/outbound-message.model';
import {
  RcsMessageCarouselContentDto,
  RcsMessageDto,
  RcsMessageImageContentDto,
  RcsMessagePdfContentDto,
  RcsMessageRichCardContentDto,
  RcsMessageTextContentDto,
  RcsMessageType,
  RcsMessageVideoContentDto,
} from '@/models/rsc-message.dto';

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

    if (payload as RcsMessageDto) {
      const content =
        PontalTechRcsApiRequestMapper.parseOutboundContent(payload);

      if (!content) {
        return [false, null, null, 'Content can not be parsed'];
      }

      const type =
        !(payload.content as RcsMessageTextContentDto) ||
        (payload.content as RcsMessageTextContentDto)?.text?.length > 160
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
    [messageType in RcsMessageType]: (
      payload: RcsMessageDto,
    ) => PontalTechRcsMessageContentsAll;
  } = {
    carousel: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageCarouselContentDto;
      return {
        carousel: content?.items?.map((item) => ({
          title: item.title,
          fileUrl: item.fileUrl,
          description: item.description,
        })),
      };
    },
    image: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageImageContentDto;
      return {
        image: {
          url: content.url,
        },
      };
    },
    pdf: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessagePdfContentDto;
      return {
        pdf: {
          url: content.url,
        },
      };
    },
    text: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageTextContentDto;
      return {
        text: {
          message: content.text,
        },
      };
    },
    video: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageVideoContentDto;
      return {
        video: {
          url: content.url,
        },
      };
    },
    'rich-card': (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageRichCardContentDto;
      return {
        richCard: {
          title: content.title,
          description: content.description,
          fileUrl: content.fileUrl,
        },
      };
    },
  } as const;

  private static parseOutboundContent(payload: RcsMessageDto) {
    return PontalTechRcsApiRequestMapper.DTO_TO_CONTENT_MAP[
      payload.content.messageType
    ](payload);
  }
}
