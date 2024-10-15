import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { EXCHANGE_NAMES } from '@/config/constants';
import { BrokerType, ChannelType } from '@/models/enums';
import { OutboundMessage } from '@/models/outbound-message.model';
import { RcsPontalTechService } from '@/modules/rcs/pontal-tech/rcs-pontal-tech.service';

@Injectable()
export class OutboundRcsPontalTechConsumer {
  constructor(private readonly rcsPontalTechService: RcsPontalTechService) {}

  private readonly logger = new Logger(OutboundRcsPontalTechConsumer.name);

  @RabbitRPC({
    exchange: EXCHANGE_NAMES.OUTBOUND,
    routingKey: `${ChannelType.RCS}.${BrokerType.PONTAL_TECH}`,
    queue: `ms-channels-gateway.${ChannelType.RCS}.${BrokerType.PONTAL_TECH}`,
    createQueueIfNotExists: true,
    queueOptions: {
      durable: true,
      autoDelete: true,
      deadLetterExchange: EXCHANGE_NAMES.OUTBOUND_DLX,
    },
  })
  public async consume(message: OutboundMessage) {
    try {
      this.logger.debug(message, 'consume :: Message received');
      await this.rcsPontalTechService.sendMessage(message);
    } catch (error) {
      this.logger.error(error, 'consume');
      return new Nack(false);
    }
  }
}
