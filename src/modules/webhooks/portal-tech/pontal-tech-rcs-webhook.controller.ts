import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PublicRoute } from '@/config/public-route';
import { BrokerType, ChannelType } from '@/models/enums';
import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/models/pontal-tech-rcs-webhook.model';
import { InboundProducer } from '@/modules/message/producers/inbound.producer';

@Controller('webhooks')
@ApiTags('Webhooks')
export class PontalTechRcsWebhookController {
  constructor(private readonly inboundProducer: InboundProducer) {}

  @Post('pontal-tech/rcs/:messageId')
  @PublicRoute()
  public async webhook(@Body() payload: PontalTechWebhookApiRequest) {
    this.inboundProducer.publish({
      channel: ChannelType.RCS,
      broker: BrokerType.PONTAL_TECH,
      payload,
    });
  }

  @Post('pontal-tech/rcs')
  @PublicRoute()
  public async webhookNew(@Body() payload: PontalTechWebhookApiRequest) {
    this.inboundProducer.publish({
      channel: ChannelType.RCS,
      broker: BrokerType.PONTAL_TECH,
      payload,
    });
  }
}
