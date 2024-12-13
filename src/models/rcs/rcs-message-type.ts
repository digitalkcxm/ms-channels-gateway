export const RcsMessageTypes = [
  'actions',
  'audio',
  'carousel',
  'text',
  'image',
  'video',
  'document',
  'location',
  'rich-card',
] as const;

export type RcsMessageType = (typeof RcsMessageTypes)[number];
