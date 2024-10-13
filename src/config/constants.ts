export const EXCHANGE_NAMES = {
  OUTBOUND: 'ms-channels-gateway.outbound',
  OUTBOUND_DLX: 'ms-channels-gateway.outbound.dlx',
  RCS_INBOUND: 'ms-rcs.inbound',
  RCS_INBOUND_DLX: 'ms-rcs.inbound.dlx',
} as const;

export const QUEUE_NAMES = {
  INBOUND: 'ms-channels-gateway.inbound',
  INBOUND_DEAD: 'ms-channels-gateway.inbound.dead',
  OUTBOUND_DEAD: 'ms-channels-gateway.outbound.dead',
  RCS_BILLING: 'ms-channels-gateway.rcs.billing',
} as const;
