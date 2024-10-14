import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';

import { RabbitMQConfigFactory } from '@/config/rabbit-mq-config-factory';
import { PontalTechModule } from '@/modules/brokers/pontal-tech/pontal-tech.module';
import { EntityManagerModule } from '@/modules/entity-manager/entity-manager.module';
import { MessageModule } from '@/modules/message/message.module';

import { OutboundRcsConsumer } from './pontal-tech/outbound-rcs.consumer';
import { RcsPontalTechService } from './pontal-tech/rcs-pontal-tech.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigFactory,
    }),
    EntityManagerModule,
    MessageModule,
    PontalTechModule,
  ],
  providers: [RcsPontalTechService, OutboundRcsConsumer],
  exports: [RcsPontalTechService],
})
export class RcsModule {}
