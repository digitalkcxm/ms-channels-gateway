import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { TlsOptions } from 'tls';

import { EnvVars } from 'src/config/env-vars';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<EnvVars>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    const dbReadHost = this.configService.get<string>('DB_READ_HOST');
    const slaves: PostgresConnectionCredentialsOptions[] = dbReadHost
      ? [
          {
            host: dbReadHost,
            username: this.configService.get<string>('DB_USERNAME'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.getOrThrow<string>('DB_DATABASE'),
            port: this.configService.get<number>('DB_PORT', 5432),
          },
        ]
      : [];

    const ca = this.configService.get<string>('DB_CA_CERTIFICATE');
    const ssl: TlsOptions = ca ? { ca, rejectUnauthorized: false } : {};

    return {
      applicationName: 'ms-channels-gateway',
      autoLoadEntities: true,
      logging: false,
      // migrationsRun: true,
      namingStrategy: new SnakeNamingStrategy(),
      ssl,
      synchronize: false,
      type: 'postgres',
      useUTC: true,
      verboseRetryLog: true,
      replication: {
        master: {
          host: this.configService.getOrThrow<string>('DB_HOST'),
          username: this.configService.get<string>('DB_USERNAME'),
          password: this.configService.get<string>('DB_PASSWORD'),
          database: this.configService.getOrThrow<string>('DB_DATABASE'),
          port: this.configService.get<number>('DB_PORT', 5432),
        },
        slaves,
      },
    };
  }
}
