import { Body, Controller, Headers, Post } from '@nestjs/common';

import { OutboundProducer } from './producers/outbound.producer';

import { BrokerType, ChannelType } from '../database/entities/enums';

@Controller('message')
export class MessageController {
  constructor(private readonly outboundProducer: OutboundProducer) {}

  @Post('publish')
  async publish(
    @Headers('Authorization') companyToken: string,
    @Body() body: { channel: ChannelType; broker: BrokerType; data: unknown },
  ) {
    const { channel, broker, data } = body;

    return this.outboundProducer.publish(channel, broker, {
      companyToken,
      data,
    });
  }
}
