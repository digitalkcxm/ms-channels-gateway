import { Body, Controller, Post } from '@nestjs/common';

import { RcsMessageModel } from './models/rsc-message.model';
import { OutboundProducer } from './producers/outbound.producer';

import { BrokerType, ChannelType } from '../database/entities/enums';

@Controller('message')
export class MessageController {
  constructor(private readonly outboundProducer: OutboundProducer) {}

  @Post('publish')
  async publish(
    @Body()
    body: {
      channel: ChannelType;
      broker: BrokerType;
      data: RcsMessageModel;
    },
  ) {
    const { channel, broker, data } = body;

    return this.outboundProducer.publish(channel, broker, data);
  }
}
