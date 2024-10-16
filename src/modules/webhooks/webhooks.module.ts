import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/modules/database/database.module';
import { EntityManagerModule } from '@/modules/entity-manager/entity-manager.module';
import { MessageModule } from '@/modules/message/message.module';

import { PontalTechRcsWebhookController } from './portal-tech/pontal-tech-rcs-webhook.controller';

@Module({
  imports: [DatabaseModule, EntityManagerModule, MessageModule],
  controllers: [PontalTechRcsWebhookController],
  providers: [],
})
export class WebhooksModule {}
