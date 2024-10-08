import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QUEUE_NAMES } from '@/config/constants';
import { EnvVars } from '@/config/env-vars';
import { DatabaseModule } from '@/modules/database/database.module';

import { OutboundBillingConsumer } from './consumers/outbound-billing.consumer';
import { OutboundRcsConsumer } from './consumers/outbound-rcs.consumer';
import { MessageController } from './message.controller';
import { InboundProducer } from './producers/inbound.producer';
import { OutboundRcsProducer } from './producers/outbound-rcs.producer';
import { OutboundProducer } from './producers/outbound.producer';

@Module({
  imports: [
    DatabaseModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvVars>) => {
        const username = configService.getOrThrow<string>('RABBITMQ_USERNAME');
        const password = configService.getOrThrow<string>('RABBITMQ_PASSWORD');
        const host = configService.getOrThrow<string>('RABBITMQ_HOST');
        const port = configService.get<number>('RABBITMQ_PORT', 5672);
        const protocol = configService.get<boolean>('RABBITMQ_SECURE', false)
          ? 'amqps'
          : 'amqp';

        return {
          uri: `${protocol}://${username}:${password}@${host}:${port}/${username}`,
          connectionInitOptions: {
            wait: false,
          },
          name: 'ms-channels-gateway',
          exchanges: [
            {
              name: QUEUE_NAMES.OUTBOUND,
              type: 'topic',
              createExchangeIfNotExists: true,
              options: {
                autoDelete: true,
                durable: true,
              },
            },
          ],
          registerHandlers: true,
        };
      },
    }),
  ],
  controllers: [MessageController],
  providers: [
    InboundProducer,
    OutboundBillingConsumer,
    OutboundProducer,
    OutboundRcsConsumer,
    OutboundRcsProducer,
  ],
})
export class MessageModule {}
