import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs';

import { EnvVars } from '@/config/env-vars';

import type {
  PontalTechRcsMessageApiRequest,
  PontalTechSendRcsApiResponse,
} from './pontal-tech-rcs.models';

@Injectable()
export class PontalTechRcsIntegrationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvVars>,
  ) {}

  private readonly logger = new Logger(PontalTechRcsIntegrationService.name);

  public sendRcsBasicMessage(model: PontalTechRcsMessageApiRequest) {
    return this.httpService
      .post<PontalTechSendRcsApiResponse>('/api/v2/rcs', {
        ...model,
        callback: this.configService.getOrThrow<string>(
          'PONTALTECH_WEBHOOK_URL',
        ),
      })
      .pipe(
        map(({ data }) => data),
        catchError((error) => {
          this.logger.error(error, 'sendRcsBasicMessage');
          this.logger.debug(model, 'sendRcsBasicMessage :: model');
          throw error;
        }),
      );
  }

  public sendRcsSingleMessage(model: PontalTechRcsMessageApiRequest) {
    return this.httpService
      .post<PontalTechSendRcsApiResponse>('/api/v3/single', {
        ...model,
        callback: this.configService.getOrThrow<string>(
          'PONTALTECH_WEBHOOK_URL',
        ),
      })
      .pipe(
        map(({ data }) => data),
        catchError((error) => {
          this.logger.error(error, 'sendRcsSingleMessage');
          this.logger.debug(model, 'sendRcsSingleMessage :: model');
          throw error;
        }),
      );
  }
}
