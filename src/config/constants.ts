export const CHANNELS = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

export const EXCHANGE_NAMES = {
  OUTBOUND: 'ms-channels-gateway.outbound',
  OUTBOUND_DLX: 'ms-channels-gateway.outbound.dlx',
  INBOUND: 'ms-channels-gateway.inbound',
  INBOUND_DLX: 'ms-channels-gateway.inbound.dlx',
} as const;

export const QUEUE_NAMES = {
  INBOUND: 'ms-channels-gateway.inbound',
  INBOUND_MEDIA: 'ms-channels-gateway.inbound.media',
  INBOUND_DEAD: 'ms-channels-gateway.inbound.dead',
  OUTBOUND_DEAD: 'ms-channels-gateway.outbound.dead',
  RCS_BILLING: 'ms-channels-gateway.rcs.billing',
} as const;

export const QUEUE_MESSAGE_HEADERS = {
  X_RETRY_COUNT: 'x-retry-count',
};
