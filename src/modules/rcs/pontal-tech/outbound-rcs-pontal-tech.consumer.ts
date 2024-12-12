import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { CHANNELS, EXCHANGE_NAMES, QUEUE_NAMES } from '@/config/constants';
import { BrokerType, ChannelType } from '@/models/enums';
import { OutboundMessageDto } from '@/models/outbound-message.dto';
import { RcsPontalTechService } from '@/modules/rcs/pontal-tech/rcs-pontal-tech.service';

@Injectable()
export class OutboundRcsPontalTechConsumer {
  constructor(private readonly rcsPontalTechService: RcsPontalTechService) {}

  private readonly logger = new Logger(OutboundRcsPontalTechConsumer.name);

  @RabbitRPC({
    exchange: EXCHANGE_NAMES.OUTBOUND,
    routingKey: `${ChannelType.RCS}.${BrokerType.PONTAL_TECH}`,
    queue: QUEUE_NAMES.OUTBOUND_RCS_PONTAL_TECH,
    createQueueIfNotExists: true,
    queueOptions: {
      channel: CHANNELS.OUTBOUND,
      deadLetterRoutingKey: `${ChannelType.RCS}.${BrokerType.PONTAL_TECH}`,
      durable: true,
      autoDelete: false,
      deadLetterExchange: EXCHANGE_NAMES.OUTBOUND_DLX,
    },
  })
  public async consume(message: OutboundMessageDto) {
    try {
      this.logger.debug(message, 'consume :: Message received');
      await this.rcsPontalTechService.outbound(message);
    } catch (error) {
      this.logger.error(error, 'consume');
      return new Nack(false);
    }
  }
}
