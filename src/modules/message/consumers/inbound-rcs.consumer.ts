import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EXCHANGE_NAMES, QUEUE_NAMES } from '@/config/constants';
import { EnvVars } from '@/config/env-vars';
import { ChannelType } from '@/modules/database/entities/enums';
import { ChannelConfigService } from '@/modules/entity-manager/services/channel-config.service';

import { InboundMessage } from '../models/inbound-message.model';
import { InboundProducer } from '../producers/inbound.producer';

@Injectable()
export class InboundRcsConsumer {
  constructor(
    private readonly configService: ConfigService<EnvVars>,
    private readonly inboundProducer: InboundProducer,
    private readonly channelConfigService: ChannelConfigService,
  ) {}

  private readonly logger = new Logger(InboundRcsConsumer.name);

  @RabbitRPC({
    exchange: EXCHANGE_NAMES.RCS_INBOUND,
    routingKey: `${ChannelType.RCS}.#`,
    queue: QUEUE_NAMES.INBOUND,
    createQueueIfNotExists: true,
    queueOptions: {
      durable: true,
      autoDelete: true,
      deadLetterExchange: EXCHANGE_NAMES.RCS_INBOUND_DLX,
    },
  })
  public async inboundRcsHandler(message: InboundMessage) {
    try {
      this.logger.log(message, 'inboundRcsHandler :: Message received');

      const { companyToken } = await this.channelConfigService.getById(
        message.channelConfigId,
        false,
      );

      return await this.inboundProducer.publish(companyToken, message);
    } catch (error) {
      this.logger.error(error, 'MessageBaseModel');
      return new Nack(false);
    }
  }
}
