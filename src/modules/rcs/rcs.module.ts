import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';

import { RabbitMQConfigFactory } from '@/config/rabbit-mq-config-factory';
import { PontalTechModule } from '@/modules/brokers/pontal-tech/pontal-tech.module';
import { EntityManagerModule } from '@/modules/entity-manager/entity-manager.module';
import { MessageModule } from '@/modules/message/message.module';

import { OutboundRcsPontalTechConsumer } from './pontal-tech/outbound-rcs-pontal-tech.consumer';
import { RcsPontalTechService } from './pontal-tech/rcs-pontal-tech.service';
import { OutboundBillingSubscriber } from './subscribers/outbound-billing.subscriber';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigFactory,
    }),
    EntityManagerModule,
    MessageModule,
    PontalTechModule,
  ],
  providers: [
    RcsPontalTechService,
    OutboundRcsPontalTechConsumer,
    OutboundBillingSubscriber,
  ],
  exports: [RcsPontalTechService],
})
export class RcsModule {}
