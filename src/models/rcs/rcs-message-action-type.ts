export const RcsMessageActionTypes = ['openUrl', 'call', 'reply'] as const;

export type RcsMessageActionType = (typeof RcsMessageActionTypes)[number];
