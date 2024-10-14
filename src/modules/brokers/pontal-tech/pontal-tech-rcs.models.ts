import { RcsMessageModel } from '@/models/rsc-message.model';

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
    vars: {
      chatId: string;
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

export type PontalTechWebhookType = 'text' | 'DELIVERED' | 'READ';

export type PontalTechWebhookApiRequest = {
  reference: string;
  event_id: string;
  direction: PontalTechWebhookDirection;
  user_id: string;
  timestamp: Date;
  channel: string;
  type: PontalTechWebhookType;
  message?: {
    contentType?: 'text' | 'image' | 'video' | 'pdf' | 'richCard' | 'carousel';
    [prop: string]: any;
  };
  vars?: { [propName: string]: string };
};

export class PontalTechRcsApiRequestMapper {
  public static fromMessageModel(
    account: string,
    model: RcsMessageModel,
  ): PontalTechRcsMessageApiRequest {
    switch (model.type) {
      case 'basic':
        return {
          account,
          messages: model.recipients.map((number) => ({
            number,
            vars: {
              chatId: model.chatId,
            },
          })),
          content: {
            text: {
              message: model.content.text,
            },
          },
        };
      case 'standard':
        return {
          account,
          messages: model.recipients.map((number) => ({
            number,
            vars: {
              chatId: model.chatId,
            },
          })),
          content: PontalTechRcsApiRequestMapper.parseContent(model),
        };
    }
  }

  static parseContent(model: RcsMessageModel): PontalTechRcsMessageContentsAll {
    switch (model.messageType) {
      case 'text':
        return {
          text: {
            message: model.content.text,
          },
        };
      case 'image':
        return {
          image: {
            url: model.content.url,
          },
        };
      case 'video':
        return {
          video: {
            url: model.content.url,
          },
        };
      case 'pdf':
        return {
          pdf: {
            url: model.content.url,
          },
        };
      case 'richCard':
        return {
          richCard: {
            title: model.content.title,
            description: model.content.description,
            fileUrl: model.content.fileUrl,
          },
        };
      case 'carousel':
        return {
          carousel: model.content.map((item) => ({
            title: item.title,
            fileUrl: item.fileUrl,
            description: item.description,
          })),
        };
    }
  }
}
