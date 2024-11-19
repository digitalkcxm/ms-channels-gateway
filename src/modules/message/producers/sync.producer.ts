import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

import { SyncModel } from '@/models/sync-message.model';

@Injectable()
export class SyncProducer {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(companyToken: string, message: SyncModel) {
    const queueName = `ms-channels-gateway.${companyToken}`;

    const channel = this.amqpConnection.channel;

    await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });

    const sentToQueue = channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
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
