import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EnvVars } from '@/config/env-vars';

import { PontalTechRcsV2IntegrationService } from './services/pontal-tech-rcs-v2-integration.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<EnvVars>) => ({
        baseURL: configService.getOrThrow<string>('PONTALTECH_API_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PontalTechRcsV2IntegrationService],
  exports: [PontalTechRcsV2IntegrationService],
})
export class PontalTechModule {}
