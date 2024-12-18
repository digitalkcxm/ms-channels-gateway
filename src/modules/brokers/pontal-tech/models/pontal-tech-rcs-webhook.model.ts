export type PontalTechWebhookDirection = 'inbound' | 'outbound';

export type PontalTechRcsWebhookType =
  | 'audio'
  | 'carousel'
  | 'contact'
  | 'document'
  | 'image'
  | 'location'
  | 'richCard'
  | 'text'
  | 'video'
  | 'basic'
  | 'conversacional'
  | 'single'
  | 'suggestion'
  | 'suggestionResponse'
  | 'DELIVERED'
  | 'READ'
  | 'EXCEPTION'
  | 'ERROR';

export type PontalTechRcsWebhookStatus = 'bloqueado por duplicidade';

export type PontalTechRcsContentType =
  | 'audio'
  | 'carousel'
  | 'text'
  | 'image'
  | 'video'
  | 'contact'
  | 'document'
  | 'location'
  | 'richCard'
  | 'carousel'
  | 'suggestion'
  | 'suggestionResponse';

export type PontalTechRcsWebhookFileContent = {
  mimeType: string;
  fileSizeBytes: number;
  fileName: string;
  fileUri: string;
};

export type PontalTechRcsWebhookAudioContent = {
  contentType?: 'audio';
  audio: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookCarouselContent = {
  contentType?: 'carousel';
  message: PontalTechRcsWebhookCarouselContentMessage;
};

export type PontalTechRcsWebhookContactContent = {
  contentType?: 'contact';
  contact: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookDocumentContent = {
  contentType?: 'document';
  document: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookFileTextContent = {
  contentType?: 'document';
  text: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookImageContent = {
  contentType?: 'image';
  image: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookLocationContentMessage = {
  latitude: string;
  longitude: string;
};

export type PontalTechRcsWebhookLocationContent = {
  contentType?: 'location';
  location: PontalTechRcsWebhookLocationContentMessage;
};

export type PontalTechRcsWebhookRichCardContentMessage = {
  title: string;
  description?: string;
  fileUrl: string;
  suggestions?: PontalTechRcsWebhookSuggestionItem[];
};

export type PontalTechRcsWebhookCarouselItem = {
  title: string;
  description?: string;
  fileUrl: string;
  suggestions?: PontalTechRcsWebhookSuggestionItem[];
};

export type PontalTechRcsWebhookCarouselContentMessage = {
  text: string;
  items?: PontalTechRcsWebhookCarouselItem[];
};

export type PontalTechRcsWebhookRichCardContent = {
  contentType?: 'richCard';
  message: PontalTechRcsWebhookRichCardContentMessage;
};

export type PontalTechRcsWebhookTextContent = {
  contentType?: 'text';
  text: string;
};

export type PontalTechRcsWebhookVideoContent = {
  contentType?: 'video';
  video: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookSuggestionItem = {
  type: 'openUrl' | 'call' | 'reply';
  title?: string;
  value: string;
};

export type PontalTechRcsWebhookSuggestionContent = {
  contentType?: 'suggestion';
  text?: string;
  suggestion: {
    suggestions: PontalTechRcsWebhookSuggestionItem[];
  };
};

export type PontalTechRcsWebhookSuggestionResponseType =
  | 'OPENURL'
  | 'CALL'
  | 'REPLY';

export type PontalTechRcsWebhookSuggestionResponse = {
  type: PontalTechRcsWebhookSuggestionResponseType;
  text?: string;
  postbackData: string;
};

export type PontalTechRcsWebhookSuggestionResponseContent = {
  contentType?: 'suggestionResponse';
  suggestionResponse: PontalTechRcsWebhookSuggestionResponse;
};

export type PontalTechRcsWebhookContentTypes =
  | PontalTechRcsWebhookAudioContent
  | PontalTechRcsWebhookCarouselContent
  | PontalTechRcsWebhookContactContent
  | PontalTechRcsWebhookDocumentContent
  | PontalTechRcsWebhookFileTextContent
  | PontalTechRcsWebhookImageContent
  | PontalTechRcsWebhookLocationContent
  | PontalTechRcsWebhookRichCardContent
  | PontalTechRcsWebhookTextContent
  | PontalTechRcsWebhookVideoContent
  | PontalTechRcsWebhookSuggestionResponseContent
  | string;

export type PontalTechWebhookApiRequest = {
  reference: string;
  event_id: string;
  session_id?: string;
  direction: PontalTechWebhookDirection;
  user_id: string;
  timestamp: Date;
  channel: string;
  status: PontalTechRcsWebhookStatus;
  type: PontalTechRcsWebhookType;
  message?: PontalTechRcsWebhookContentTypes;
  vars?: { [propName: string]: string };
};
