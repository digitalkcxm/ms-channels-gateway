export type EnvVars = {
  PORT?: number;
  NODE_ENV?: 'development' | 'production' | 'test';
  LOG_LEVEL?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

  DB_HOST: string;
  DB_READ_HOST: string;
  DB_PORT?: number;
  DB_DATABASE: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_CA_CERTIFICATE?: string;

  RABBITMQ_HOST: string;
  RABBITMQ_PORT?: number;
  RABBITMQ_USERNAME: string;
  RABBITMQ_PASSWORD: string;
  RABBITMQ_SECURE?: boolean;

  DEFAULT_CACHE_TTL?: number;

  REDIS_HOST: string;
  REDIS_PORT?: number;
  REDIS_USERNAME?: string;
  REDIS_PASSWORD?: string;

  RCS_INBOUND_EXCHANGE_NAME: string;
  RCS_INBOUND_EXCHANGE_DLX_NAME: string;
  RCS_OUTBOUND_EXCHANGE_NAME: string;
  RCS_OUTBOUND_EXCHANGE_DLX_NAME: string;
};
