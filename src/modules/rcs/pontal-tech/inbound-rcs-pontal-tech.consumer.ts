import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

import {
  CHANNELS_PREFETCH,
  EXCHANGE_NAMES,
  QUEUE_MESSAGE_HEADERS,
} from '@/config/constants';
import { BrokerType, ChannelType } from '@/models/enums';
import { InboundMessage } from '@/models/inbound-message.model';
import { InboundProducer } from '@/modules/message/producers/inbound.producer';
import { RcsPontalTechService } from '@/modules/rcs/pontal-tech/rcs-pontal-tech.service';
import { ChatNotFoundException } from '@/models/exceptions/chat-not-found.exception';

@Injectable()
export class InboundRcsPontalTechConsumer {
  constructor(
    private readonly inboundProducer: InboundProducer,
    private readonly rcsPontalTechService: RcsPontalTechService,
  ) {}

  private readonly logger = new Logger(InboundRcsPontalTechConsumer.name);

  @RabbitRPC({
    exchange: EXCHANGE_NAMES.INBOUND,
    routingKey: `${ChannelType.RCS}.${BrokerType.PONTAL_TECH}`,
    queue: `ms-channels-gateway.${ChannelType.RCS}.${BrokerType.PONTAL_TECH}.inbound`,
    createQueueIfNotExists: true,
    queueOptions: {
      channel: CHANNELS_PREFETCH.INBOUND,
      durable: true,
      autoDelete: true,
      deadLetterExchange: EXCHANGE_NAMES.INBOUND_DLX,
    },
  })
  public async consume(
    message: InboundMessage,
    originalMessage: ConsumeMessage,
  ) {
    try {
      this.logger.debug(message, 'consume :: Message received');

      const retryCount =
        (originalMessage.properties.headers[
          QUEUE_MESSAGE_HEADERS.X_RETRY_COUNT
        ] as number) ?? 0;

      if (retryCount < 3) {
        try {
          await this.rcsPontalTechService.receiveMessage(message);

          return;
        } catch (error) {
          if (error instanceof ChatNotFoundException) {
            this.logger.warn(error, 'consume :: retrying...');
            await this.inboundProducer.publish(message, retryCount + 1);

            return;
          }

          throw error;
        }
      }

      throw new Error('Max retries reached');
    } catch (error) {
      this.logger.error(error, 'consume');

      return new Nack(false);
    }
  }
}
