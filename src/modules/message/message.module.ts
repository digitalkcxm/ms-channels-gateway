import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { S3 } from 'aws-sdk';

import { RabbitMQConfigFactory } from '@/config/rabbit-mq-config-factory';
import { DatabaseModule } from '@/modules/database/database.module';
import { EntityManagerModule } from '@/modules/entity-manager/entity-manager.module';

import { MessageController } from './message.controller';
import { InboundProducer } from './producers/inbound.producer';
import { OutboundProducer } from './producers/outbound.producer';
import { SyncProducer } from './producers/sync.producer';
import { RcsMessageService } from './services/rcs-message.service';

import { AwsSdkModule } from '../aws-sdk/aws-sdk.module';

@Module({
  imports: [
    AwsSdkModule.forFeatures([S3]),
    HttpModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigFactory,
    }),
    DatabaseModule,
    EntityManagerModule,
  ],
  controllers: [MessageController],
  providers: [
    SyncProducer,
    RcsMessageService,
    InboundProducer,
    OutboundProducer,
  ],
  exports: [RcsMessageService, InboundProducer],
})
export class MessageModule {}
