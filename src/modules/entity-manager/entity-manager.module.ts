import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/modules/database/database.module';

import { ChannelConfigController } from './channels-gateway/controllers/channel-config.controller';
import { ChannelLinkController } from './channels-gateway/controllers/channel-link.controller';
import { ChannelConfigService } from './channels-gateway/services/channel-config.service';
import { ChannelLinkService } from './channels-gateway/services/channel-link.service';
import { RcsAccountController } from './rcs/controllers/rcs-account.controller';
import { ChatService } from './rcs/services/chat.service';
import { MessageService } from './rcs/services/message.service';
import { RcsAccountService } from './rcs/services/rcs-account.service';
import { TemplateController } from './templates/controllers';
import { TemplateService } from './templates/services';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ChannelConfigController,
    ChannelLinkController,
    RcsAccountController,
    TemplateController,
  ],
  providers: [
    ChannelConfigService,
    ChannelLinkService,
    ChatService,
    MessageService,
    RcsAccountService,
    TemplateService,
  ],
  exports: [
    ChannelConfigService,
    ChannelLinkService,
    ChatService,
    MessageService,
    RcsAccountService,
    TemplateService,
  ],
})
export class EntityManagerModule {}
