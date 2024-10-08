import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QUEUE_NAMES } from '@/config/constants';
import { EnvVars } from '@/config/env-vars';
import { BrokerType, ChannelType } from '@/modules/database/entities/enums';

import { OutboundRcsProducer } from '../producers/outbound-rcs.producer';

@Injectable()
export class OutboundRcsConsumer {
  constructor(
    private readonly configService: ConfigService<EnvVars>,
    private readonly outboundRcsProducer: OutboundRcsProducer,
  ) {}

  private readonly logger = new Logger(OutboundRcsConsumer.name);

  @RabbitRPC({
    exchange: QUEUE_NAMES.OUTBOUND,
    routingKey: `${ChannelType.RCS}.${BrokerType.PONTAL_TECH}`,
    queue: `ms-channels-gateway.${ChannelType.RCS}.${BrokerType.PONTAL_TECH}`,
    createQueueIfNotExists: true,
    queueOptions: {
      autoDelete: true,
    },
  })
  public async rcsPontalTechHandler(message: any) {
    this.logger.log('rcsPontalTechHandler :: Message received', message);
    await this.outboundRcsProducer.publish(message);
  }
}
