export const EXCHANGE_NAMES = {
  OUTBOUND: 'ms-channels-gateway.outbound',
  OUTBOUND_DLX: 'ms-channels-gateway.outbound.dlx',
  INBOUND: 'ms-channels-gateway.inbound',
} as const;

export const QUEUE_NAMES = {
  OUTBOUND_DEAD: 'ms-channels-gateway.outbound.dead',
  RCS_BILLING: 'ms-channels-gateway.rcs.billing',
} as const;
