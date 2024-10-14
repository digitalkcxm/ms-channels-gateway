import { Body, Controller, Post } from '@nestjs/common';

import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/pontal-tech-rcs.models';

import { PontalTechRcsWebhookService } from './pontal-tech-rcs-webhook.service';

@Controller('webhooks')
export class PontalTechRcsWebhookController {
  constructor(
    private readonly rcsWebhookService: PontalTechRcsWebhookService,
  ) {}

  @Post('pontal-tech/rcs')
  public async webhook(@Body() body: PontalTechWebhookApiRequest) {
    await this.rcsWebhookService.inboundMessage(body);
  }
}
