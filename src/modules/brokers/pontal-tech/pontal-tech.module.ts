import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EnvVars } from '@/config/env-vars';

import { PontalTechRcsV2IntegrationService } from './v2/pontal-tech-rcs-v2-integration.service';
import { PontalTechRcsV3IntegrationService } from './v3/pontal-tech-rcs-v3-integration.service';

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
  providers: [
    PontalTechRcsV2IntegrationService,
    PontalTechRcsV3IntegrationService,
  ],
  exports: [
    PontalTechRcsV2IntegrationService,
    PontalTechRcsV3IntegrationService,
  ],
})
export class PontalTechModule {}
