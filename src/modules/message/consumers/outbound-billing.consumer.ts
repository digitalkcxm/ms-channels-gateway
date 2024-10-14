import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { EXCHANGE_NAMES, QUEUE_NAMES } from '@/config/constants';
import { ChannelType } from '@/modules/database/channels-gateway/entities/enums';

@Injectable()
export class OutboundBillingConsumer {
  constructor() {}

  private readonly logger = new Logger(OutboundBillingConsumer.name);

  @RabbitSubscribe({
    exchange: EXCHANGE_NAMES.OUTBOUND,
    routingKey: `${ChannelType.RCS}.#`,
    queue: QUEUE_NAMES.RCS_BILLING,
    createQueueIfNotExists: true,
    queueOptions: {
      autoDelete: true,
      durable: true,
    },
  })
  public async rcsBillingHandler() {
    this.logger.warn('rcsBillingHandler :: TODO save billing entry');
  }
}
