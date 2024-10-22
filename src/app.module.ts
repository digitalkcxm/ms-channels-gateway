import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { LoggerModule } from 'nestjs-pino';

import { EnvVars } from './config/env-vars';
import { AwsSdkModule } from './modules/aws-sdk/aws-sdk.module';
import { PontalTechModule } from './modules/brokers/pontal-tech/pontal-tech.module';
import { DatabaseModule } from './modules/database/database.module';
import { EntityManagerModule } from './modules/entity-manager/entity-manager.module';
import { HealthModule } from './modules/health/health.module';
import { MessageModule } from './modules/message/message.module';
import { RcsModule } from './modules/rcs/rcs.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        inject: [ConfigService],
        useFactory: (configService: ConfigService<EnvVars>) => ({
          region: configService.getOrThrow<string>('AWS_REGION'),
          accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.getOrThrow<string>(
            'AWS_SECRET_ACCESS_KEY',
          ),
        }),
      },
    }),
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvVars>) => {
        const store = await redisStore({
          socket: {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT', 6379),
            reconnectStrategy: 2000,
          },
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
          name: 'ms-channels-gateway',
          ttl: configService.get<number>('DEFAULT_CACHE_TTL', 60 * 1000),
          clientInfoTag: 'ms-channels-gateway',
        });

        return {
          store: store as unknown as CacheStore,
          ttl: configService.get<number>('DEFAULT_CACHE_TTL', 60 * 1000),
        };
      },
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvVars>) => ({
        pinoHttp: {
          level: configService.get<string>('LOG_LEVEL', 'info'),
          transport: {
            targets: [
              true ||
              configService.get<string>('NODE_ENV', 'production') ===
                'development'
                ? {
                    target: 'pino-pretty',
                    options: {
                      // singleLine: true,
                    },
                  }
                : undefined,
            ],
          },
        },
      }),
    }),
    DatabaseModule,
    EntityManagerModule,
    MessageModule,
    PontalTechModule,
    WebhooksModule,
    RcsModule,
    HealthModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
