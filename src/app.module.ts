import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { LoggerModule } from 'nestjs-pino';

import { EnvVars } from './config/env-vars';
import { PontalTechModule } from './modules/brokers/pontal-tech/pontal-tech.module';
import { DatabaseModule } from './modules/database/database.module';
import { EntityManagerModule } from './modules/entity-manager/entity-manager.module';
import { MessageModule } from './modules/message/message.module';
import { RcsModule } from './modules/rcs/rcs.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
          level: configService.get<string>('LOG_LEVEL', 'trace'),
          transport: {
            targets: [
              true ||
              configService.get<string>('NODE_ENV', 'development') ===
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
  ],
  providers: [],
})
export class AppModule {}
