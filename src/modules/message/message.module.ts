import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RabbitMQConfigFactory } from '@/config/rabbit-mq-config-factory';
import { DatabaseModule } from '@/modules/database/database.module';
import { EntityManagerModule } from '@/modules/entity-manager/entity-manager.module';

import { MessageController } from './message.controller';
import { InboundProducer } from './producers/inbound.producer';
import { OutboundProducer } from './producers/outbound.producer';
import { SyncProducer } from './producers/sync.producer';
import { OutboundMessageService } from './services/outbound-message.service';
import { RcsMessageService } from './services/rcs-message.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigFactory,
    }),
    HttpModule,
    DatabaseModule,
    EntityManagerModule,
  ],
  controllers: [MessageController],
  providers: [
    InboundProducer,
    OutboundMessageService,
    OutboundProducer,
    SyncProducer,
    RcsMessageService,
  ],
  exports: [RcsMessageService, InboundProducer],
})
export class MessageModule {}
