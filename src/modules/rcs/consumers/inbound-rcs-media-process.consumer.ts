import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { CHANNELS, EXCHANGE_NAMES, QUEUE_NAMES } from '@/config/constants';
import { InboundMediaMessage } from '@/models/inbound-message.model';
import { InboundProducer } from '@/modules/message/producers/inbound.producer';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';

@Injectable()
export class InboundRcsMediaProcessConsumer {
  constructor(
    private readonly inboundProducer: InboundProducer,
    private readonly rcsMessageService: RcsMessageService,
  ) {}

  private readonly logger = new Logger(InboundRcsMediaProcessConsumer.name);

  @RabbitRPC({
    exchange: EXCHANGE_NAMES.INBOUND,
    routingKey: 'media-process',
    queue: QUEUE_NAMES.INBOUND_MEDIA,
    createQueueIfNotExists: true,
    queueOptions: {
      channel: CHANNELS.INBOUND,
      durable: true,
      autoDelete: false,
      deadLetterExchange: EXCHANGE_NAMES.INBOUND_DLX,
    },
  })
  public async consume(message: InboundMediaMessage) {
    try {
      this.logger.debug(message, 'consume :: media message received');

      await this.rcsMessageService.mediaProcess(message);
    } catch (error) {
      this.logger.error(error, 'consume');

      return new Nack();
    }
  }
}
