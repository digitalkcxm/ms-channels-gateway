import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvVars } from '@/config/env-vars';

import { InboundEvents } from '../enums';

@Injectable()
export class InboundProducer {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService<EnvVars>,
  ) {}

  async publish(
    companyToken: string,
    inboundEvent: InboundEvents,
    data: unknown,
  ) {
    const queueName = `ms-channels-gateway.${companyToken}`;

    const channel = this.amqpConnection.channel;

    await channel.assertQueue(queueName);

    const sentToQueue = channel.sendToQueue(
      queueName,
      Buffer.from(
        JSON.stringify({
          type: inboundEvent,
          data,
        }),
      ),
      {
        persistent: true,
      },
    );

    if (!sentToQueue) {
      //TODO: add some logging and store it in a table in the database for later reprocess
      throw new Error('Failed to send message to queue');
    }
  }
}
