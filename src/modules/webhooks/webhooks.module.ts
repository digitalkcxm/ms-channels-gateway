import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/modules/database/database.module';
import { MessageModule } from '@/modules/message/message.module';

import { PontalTechRcsWebhookController } from './portal-tech/pontal-tech-rcs-webhook.controller';
import { PontalTechRcsWebhookService } from './portal-tech/pontal-tech-rcs-webhook.service';

@Module({
  imports: [DatabaseModule, MessageModule],
  controllers: [PontalTechRcsWebhookController],
  providers: [PontalTechRcsWebhookService],
})
export class WebhooksModule {}
