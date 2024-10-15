import { MessageBaseModel } from './message.model';

export type RcsMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'pdf'
  | 'richCard'
  | 'carousel';

export type RcsMessageTextContentModel = {
  text: string;
};

export type RcsMessageTextModel = {
  messageType: 'text';
  content: RcsMessageTextContentModel;
};

export type RcsMessageImageContentModel = {
  url: string;
};

export type RcsMessageImageModel = {
  messageType: 'image';
  content: RcsMessageImageContentModel;
};

export type RcsMessageVideoContentModel = {
  url: string;
};

export type RcsMessageVideoModel = {
  messageType: 'video';
  content: RcsMessageVideoContentModel;
};

export type RcsMessagePdfContentModel = {
  url: string;
};

export type RcsMessagePdfModel = {
  messageType: 'pdf';
  content: RcsMessagePdfContentModel;
};

export type RcsMessageRichCardContentModel = {
  title: string;
  description?: string; // Max. 2000 characters
  fileUrl: string;
};

export type RcsMessageRichCardModel = {
  messageType: 'richCard';
  content: RcsMessageRichCardContentModel;
};

export type RcsMessageCarouselContentModel = {
  title: string;
  description?: string;
  fileUrl: string;
}[];

export type RcsMessageCarouselModel = {
  messageType: 'carousel';
  content: RcsMessageCarouselContentModel;
};

export type RcsMessageAllModels =
  | RcsMessageTextModel
  | RcsMessageImageModel
  | RcsMessageVideoModel
  | RcsMessagePdfModel
  | RcsMessageRichCardModel
  | RcsMessageCarouselModel;

export type RcsMessageContentAllModels =
  | RcsMessageTextContentModel
  | RcsMessageImageContentModel
  | RcsMessageVideoContentModel
  | RcsMessagePdfContentModel
  | RcsMessageRichCardContentModel
  | RcsMessageCarouselContentModel;

export type BasicRcsMessageModel = MessageBaseModel &
  RcsMessageTextModel & {
    type: 'basic';
  };

export type StandardRcsMessageModel = MessageBaseModel &
  RcsMessageAllModels & {
    messageType: RcsMessageType;
    type: 'standard';
  };

export type RcsMessageModel = BasicRcsMessageModel | StandardRcsMessageModel;
