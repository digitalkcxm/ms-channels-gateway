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
  | 'single'
  | 'DELIVERED'
  | 'READ'
  | 'EXCEPTION'
  | 'ERROR';

export type PontalTechRcsWebhookStatus = 'bloqueado por duplicidade';

export type PontalTechRcsContentType =
  | 'text'
  | 'image'
  | 'video'
  | 'document'
  | 'richCard'
  | 'carousel';

export type PontalTechRcsWebhookFileContent = {
  mimeType: string;
  fileSizeBytes: number;
  fileName: string;
  fileUri: string;
};

export type PontalTechRcsWebhookDocumentContent = {
  contentType?: 'document';
  document: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookImageContent = {
  contentType?: 'image';
  image: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookTextContent = {
  contentType?: 'text';
  text: string;
};

export type PontalTechRcsWebhookFileTextContent = {
  contentType?: 'document';
  text: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookVideoContent = {
  contentType?: 'video';
  video: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookRichCardContentMessage = {
  title: string;
  description?: string;
  fileUrl: string;
};

export type PontalTechRcsWebhookRichCardContent = {
  contentType?: 'richCard';
  message: PontalTechRcsWebhookRichCardContentMessage;
};

export type PontalTechRcsWebhookContentTypes =
  | PontalTechRcsWebhookDocumentContent
  | PontalTechRcsWebhookImageContent
  | PontalTechRcsWebhookTextContent
  | PontalTechRcsWebhookFileTextContent
  | PontalTechRcsWebhookVideoContent
  | PontalTechRcsWebhookRichCardContent
  | string;

export type PontalTechWebhookApiRequest = {
  reference: string;
  event_id: string;
  direction: PontalTechWebhookDirection;
  user_id: string;
  timestamp: Date;
  channel: string;
  status: PontalTechRcsWebhookStatus;
  type: PontalTechRcsWebhookType;
  message?: PontalTechRcsWebhookContentTypes;
  vars?: { [propName: string]: string };
};
