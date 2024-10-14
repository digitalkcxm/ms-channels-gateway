import { Body, Controller, Post } from '@nestjs/common';

import { OutboundMessage } from '@/models/outbound-message.model';

import { OutboundProducer } from './producers/outbound.producer';

@Controller('message')
export class MessageController {
  constructor(private readonly outboundProducer: OutboundProducer) {}

  @Post('publish')
  async publish(
    @Body()
    body: OutboundMessage,
  ) {
    return this.outboundProducer.publish(body);
  }
}
