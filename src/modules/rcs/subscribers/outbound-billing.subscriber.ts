import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { EXCHANGE_NAMES, QUEUE_NAMES } from '@/config/constants';
import { ChannelType } from '@/models/enums';

@Injectable()
export class OutboundBillingSubscriber {
  constructor() {}

  private readonly logger = new Logger(OutboundBillingSubscriber.name);

  @RabbitSubscribe({
    exchange: EXCHANGE_NAMES.OUTBOUND,
    routingKey: `${ChannelType.RCS}.#`,
    queue: QUEUE_NAMES.RCS_BILLING,
    createQueueIfNotExists: true,
    queueOptions: {
      autoDelete: false,
      durable: true,
    },
  })
  public async rcsBillingHandler() {
    this.logger.warn('rcsBillingHandler :: TODO save billing entry');
  }
}
