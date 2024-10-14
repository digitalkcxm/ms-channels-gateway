import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EnvVars } from '@/config/env-vars';

import { PontalTechRcsIntegrationService } from './pontal-tech-rcs-integration.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<EnvVars>) => ({
        baseURL: configService.getOrThrow<string>('PONTALTECH_API_URL'),
        headers: {
          Authorization: `Bearer ${configService.getOrThrow<string>('PONTALTECH_API_KEY')}`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PontalTechRcsIntegrationService],
  exports: [PontalTechRcsIntegrationService],
})
export class PontalTechModule {}
