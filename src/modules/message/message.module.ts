import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';

import { RabbitMQConfigFactory } from '@/config/rabbit-mq-config-factory';
import { DatabaseModule } from '@/modules/database/database.module';
import { EntityManagerModule } from '@/modules/entity-manager/entity-manager.module';

import { OutboundBillingConsumer } from './consumers/outbound-billing.consumer';
import { MessageController } from './message.controller';
import { InboundProducer } from './producers/inbound.producer';
import { OutboundProducer } from './producers/outbound.producer';
import { RcsMessageService } from './services/rcs-message.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigFactory,
    }),
    DatabaseModule,
    EntityManagerModule,
  ],
  controllers: [MessageController],
  providers: [
    InboundProducer,
    RcsMessageService,
    OutboundBillingConsumer,
    OutboundProducer,
  ],
  exports: [RcsMessageService],
})
export class MessageModule {}
