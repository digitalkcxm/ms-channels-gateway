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
  | 'pdf'
  | 'richCard'
  | 'carousel';

export type PontalTechRcsWebhookFileContent = {
  mimeType: string;
  fileSizeBytes: number;
  fileName: string;
  fileUri: string;
};

export type PontalTechRcsWebhookImageContent = {
  contentType?: 'image';
  url: string;
};

export type PontalTechRcsWebhookTextContent = {
  contentType?: 'text';
  text: string;
};

export type PontalTechRcsWebhookVideoContent = {
  contentType?: 'video';
  image: PontalTechRcsWebhookFileContent;
};

export type PontalTechRcsWebhookContentTypes =
  | PontalTechRcsWebhookImageContent
  | PontalTechRcsWebhookTextContent
  | PontalTechRcsWebhookVideoContent
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
