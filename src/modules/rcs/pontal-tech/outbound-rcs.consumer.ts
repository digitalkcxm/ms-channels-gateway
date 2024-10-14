import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { EXCHANGE_NAMES } from '@/config/constants';
import { OutboundMessage } from '@/models/outbound-message.model';
import {
  BrokerType,
  ChannelType,
} from '@/modules/database/channels-gateway/entities/enums';
import { RcsPontalTechService } from '@/modules/rcs/pontal-tech/rcs-pontal-tech.service';

@Injectable()
export class OutboundRcsConsumer {
  constructor(private readonly rcsPontalTechService: RcsPontalTechService) {}

  private readonly logger = new Logger(OutboundRcsConsumer.name);

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
      await this.rcsPontalTechService.sendMessage(
        message.channelConfigId,
        message.data,
      );
    } catch (error) {
      this.logger.error(error, 'consume');
      return new Nack(false);
    }
  }
}
