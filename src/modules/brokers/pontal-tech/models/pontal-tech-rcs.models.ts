import { BrokerType, ChannelType } from '@/models/enums';
import { MessageContentNotSupportedException } from '@/models/exceptions/message-content-not-supported.exception';
import { RcsMessageContentParserException } from '@/models/exceptions/rcs-message-content-parser.exception';
import { OutboundMessageDto } from '@/models/outbound-message.dto';
import {
  RcsMessageCarouselContentDto,
  RcsMessageDocumentContentDto,
  RcsMessageDto,
  RcsMessageImageContentDto,
  RcsMessageLocationContentDto,
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

export type PontalTechRcsMessageLocationContent = {
  location: {
    latitude: string;
    longitude: string;
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
  | PontalTechRcsMessageCarouselContent
  | PontalTechRcsMessageImageContent
  | PontalTechRcsMessageLocationContent
  | PontalTechRcsMessagePdfContent
  | PontalTechRcsMessageRichCardContent
  | PontalTechRcsMessageTextContent
  | PontalTechRcsMessageVideoContent;

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
  ): [type?: string, model?: PontalTechRcsMessageApiRequest] {
    const { recipients, payload } = dto;

    if (payload as RcsMessageDto) {
      const content =
        PontalTechRcsApiRequestMapper.parseOutboundContent(payload);

      if (!content) {
        throw new RcsMessageContentParserException(
          ChannelType.RCS,
          BrokerType.PONTAL_TECH,
          payload,
        );
      }

      const type =
        payload.content?.messageType !== 'text' ||
        (payload.content?.messageType === 'text' &&
          (payload.content as RcsMessageTextContentDto)?.text?.length > 160)
          ? 'standard'
          : 'basic';

      return [
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

    throw new MessageContentNotSupportedException(
      ChannelType.RCS,
      BrokerType.PONTAL_TECH,
      payload,
    );
  }

  static DTO_TO_CONTENT_MAP: {
    [messageType in RcsMessageType]: (
      payload: RcsMessageDto,
    ) => PontalTechRcsMessageContentsAll;
  } = {
    audio: (payload: RcsMessageDto) => {
      throw new MessageContentNotSupportedException(
        ChannelType.RCS,
        BrokerType.PONTAL_TECH,
        payload,
      );
    },
    carousel: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageCarouselContentDto;
      return {
        carousel: content?.items?.map((item) => ({
          title: item.title,
          fileUrl: item.fileUrl,
          description: item.description,
          suggestions: item.suggestions?.map((suggestion) => ({
            title: suggestion.title,
            type: suggestion.type,
            value: suggestion.value,
          })),
        })),
      };
    },
    document: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageDocumentContentDto;
      return {
        pdf: {
          url: content.url,
        },
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
    location: (payload: RcsMessageDto) => {
      const content = payload.content as RcsMessageLocationContentDto;
      return {
        location: {
          latitude: content.latitude,
          longitude: content.longitude,
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
          suggestions: content.suggestions?.map((suggestion) => ({
            title: suggestion.title,
            type: suggestion.type,
            value: suggestion.value,
          })),
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
