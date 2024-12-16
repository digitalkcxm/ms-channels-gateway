import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs';

import { EnvVars } from '@/config/env-vars';

import { PontalTechSendRcsApiResponse } from './pontal-tech-send-rcs-api-response.model';

import { PontalTechRcsMessageApiRequest } from '../models/pontal-tech-rcs.models';

@Injectable()
export class PontalTechRcsV3IntegrationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvVars>,
  ) {}

  private readonly logger = new Logger(PontalTechRcsV3IntegrationService.name);

  public sendRcsBasicMessage(
    apiKey: string,
    model: PontalTechRcsMessageApiRequest,
    messageId: string,
  ) {
    return this.httpService
      .post<PontalTechSendRcsApiResponse>(
        '/api/v3/basic',
        {
          ...model,
          callback: this.buildCallbackURL(messageId),
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
          this.logger.error(error, 'sendRcsBasicMessage');
          throw error;
        }),
      );
  }

  public sendRcsSingleMessage(
    apiKey: string,
    model: PontalTechRcsMessageApiRequest,
    messageId: string,
  ) {
    return this.httpService
      .post<PontalTechSendRcsApiResponse>(
        '/api/v3/single',
        {
          ...model,
          callback: this.buildCallbackURL(messageId),
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
          this.logger.error(error, 'sendRcsSingleMessage');
          throw error;
        }),
      );
  }

  public sendRcsConversationalWebhook(
    apiKey: string,
    model: PontalTechRcsMessageApiRequest,
    messageId: string,
  ) {
    return this.httpService
      .post<PontalTechSendRcsApiResponse>(
        '/api/v3/webhook',
        {
          ...model,
          webhook: this.buildCallbackURL(messageId),
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
          this.logger.error(error, 'sendRcsSingleMessage');
          throw error;
        }),
      );
  }

  private buildCallbackURL(channelConfigId: string) {
    const url = this.configService.getOrThrow<string>('PONTALTECH_WEBHOOK_URL');

    const parsedUrl = url.endsWith('/') ? url : `${url}/`;

    return new URL(channelConfigId, parsedUrl);
  }
}
