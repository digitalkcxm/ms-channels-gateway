import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs';

import { EnvVars } from '@/config/env-vars';

import { PontalTechRcsMessageApiRequest } from '../models/pontal-tech-rcs.models';
import { PontalTechSendRcsApiResponse } from '../v2/pontal-tech-send-rcs-api-response.model';

@Injectable()
export class PontalTechRcsV2IntegrationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvVars>,
  ) {}

  private readonly logger = new Logger(PontalTechRcsV2IntegrationService.name);

  public send(apiKey: string, model: PontalTechRcsMessageApiRequest) {
    return this.httpService
      .post<PontalTechSendRcsApiResponse>(
        '/api/v2/rcs',
        {
          ...model,
          callback: this.configService.getOrThrow<string>(
            'PONTALTECH_WEBHOOK_URL',
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      .pipe(
        map(({ data }) => data),
        catchError((error) => {
          console.log('error', error);
          this.logger.error(model, 'sendRcsBasicMessage');
          throw new Error(error.message);
        }),
      );
  }
}
