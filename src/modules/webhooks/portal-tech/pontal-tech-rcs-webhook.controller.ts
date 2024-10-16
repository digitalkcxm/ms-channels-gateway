import { Body, Controller, Post } from '@nestjs/common';

import { BrokerType, ChannelType } from '@/models/enums';
import { PontalTechWebhookApiRequest } from '@/modules/brokers/pontal-tech/pontal-tech-rcs.models';
import { InboundProducer } from '@/modules/message/producers/inbound.producer';

@Controller('webhooks')
export class PontalTechRcsWebhookController {
  constructor(private readonly inboundProducer: InboundProducer) {}

  @Post('pontal-tech/rcs')
  public async webhook(@Body() payload: PontalTechWebhookApiRequest) {
    this.inboundProducer.publish({
      channel: ChannelType.RCS,
      broker: BrokerType.PONTAL_TECH,
      payload,
    });
  }
}
