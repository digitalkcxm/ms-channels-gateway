import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

import {
  CHANNELS,
  EXCHANGE_NAMES,
  QUEUE_MESSAGE_HEADERS,
} from '@/config/constants';
import { BrokerType, ChannelType } from '@/models/enums';
import { ChatNotReadyException } from '@/models/exceptions/chat-not-ready.exception';
import { MessageNotReadyException } from '@/models/exceptions/message-not-ready.exception';
import { InboundMessageDto } from '@/models/inbound-message.dto';
import { InboundProducer } from '@/modules/message/producers/inbound.producer';
import { RcsPontalTechService } from '@/modules/rcs/pontal-tech/rcs-pontal-tech.service';

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
      channel: CHANNELS.INBOUND,
      durable: true,
      autoDelete: false,
      deadLetterExchange: EXCHANGE_NAMES.INBOUND_DLX,
    },
  })
  public async consume(
    message: InboundMessageDto,
    originalMessage: ConsumeMessage,
  ) {
    try {
      this.logger.debug(message, 'consume :: Message received');

      const retryCount =
        (originalMessage.properties.headers[
          QUEUE_MESSAGE_HEADERS.X_RETRY_COUNT
        ] as number) ?? 0;

      if (retryCount < 5) {
        try {
          return await this.rcsPontalTechService.inbound(message);
        } catch (error) {
          const isChatNotFound = error instanceof ChatNotReadyException;
          const isMessageNotReady = error instanceof MessageNotReadyException;
          if (isChatNotFound || isMessageNotReady) {
            this.logger.warn(error, 'consume :: retrying...');

            return await this.inboundProducer.publish(message, retryCount + 1);
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
