import { Module } from '@nestjs/common';

import { PontalTechModule } from '@/modules/brokers/pontal-tech/pontal-tech.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { EntityManagerModule } from '@/modules/entity-manager/entity-manager.module';
import { MessageModule } from '@/modules/message/message.module';

import { InboundRcsMediaProcessConsumer } from './consumers/inbound-rcs-media-process.consumer';
import { InboundRcsPontalTechConsumer } from './pontal-tech/inbound-rcs-pontal-tech.consumer';
import { OutboundRcsPontalTechConsumer } from './pontal-tech/outbound-rcs-pontal-tech.consumer';
import { RcsPontalTechService } from './pontal-tech/rcs-pontal-tech.service';
import { OutboundBillingSubscriber } from './subscribers/outbound-billing.subscriber';

@Module({
  imports: [
    DatabaseModule,
    EntityManagerModule,
    MessageModule,
    PontalTechModule,
  ],
  providers: [
    RcsPontalTechService,
    InboundRcsMediaProcessConsumer,
    InboundRcsPontalTechConsumer,
    OutboundRcsPontalTechConsumer,
    OutboundBillingSubscriber,
  ],
  exports: [RcsPontalTechService],
})
export class RcsModule {}
