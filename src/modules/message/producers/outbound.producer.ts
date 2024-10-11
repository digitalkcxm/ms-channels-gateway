import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EXCHANGE_NAMES } from '@/config/constants';
import { EnvVars } from '@/config/env-vars';
import { BrokerType, ChannelType } from '@/modules/database/entities/enums';

import { RcsMessageModel } from '../models/rsc-message.model';

@Injectable()
export class OutboundProducer {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService<EnvVars>,
  ) {}

  async publish(
    channelType: ChannelType,
    brokerType: BrokerType,
    message: RcsMessageModel,
  ) {
    const exchangeName = EXCHANGE_NAMES.OUTBOUND;
    const routingKey = `${channelType}.${brokerType}`;

    const channel = this.amqpConnection.channel;

    await channel.assertExchange(exchangeName, 'topic', {
      autoDelete: true,
      durable: true,
      alternateExchange: EXCHANGE_NAMES.OUTBOUND_DLX,
    });

    const sentToQueue = channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        mandatory: true,
      },
    );

    if (!sentToQueue) {
      //TODO: add some logging and store it in a table in the database for later reprocess
      throw new Error('Failed to send message to queue');
    }
  }
}
