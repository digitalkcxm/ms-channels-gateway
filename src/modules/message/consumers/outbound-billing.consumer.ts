import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { QUEUE_NAMES } from '@/config/constants';
import { ChannelType } from '@/modules/database/entities/enums';

@Injectable()
export class OutboundBillingConsumer {
  constructor() {}

  private readonly logger = new Logger(OutboundBillingConsumer.name);

  @RabbitSubscribe({
    exchange: QUEUE_NAMES.OUTBOUND,
    routingKey: `${ChannelType.RCS}.#`,
    queue: `ms-channels-gateway.${ChannelType.RCS}.billing`,
    createQueueIfNotExists: true,
    queueOptions: {
      autoDelete: true,
    },
  })
  public async rcsBillingHandler() {
    this.logger.warn('rcsBillingHandler :: TODO save billing entry');
  }
}
