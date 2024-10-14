import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/modules/database/database.module';

import { ChannelConfigController } from './channels-gateway/controllers/channel-config.controller';
import { ChannelLinkController } from './channels-gateway/controllers/channel-link.controller';
import { ChannelConfigService } from './channels-gateway/services/channel-config.service';
import { ChannelLinkService } from './channels-gateway/services/channel-link.service';
import { RcsAccountController } from './rcs/controllers/rcs-account.controller';
import { RcsAccountService } from './rcs/services/rcs-account.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ChannelConfigController,
    ChannelLinkController,
    RcsAccountController,
  ],
  providers: [ChannelConfigService, ChannelLinkService, RcsAccountService],
  exports: [ChannelConfigService, ChannelLinkService, RcsAccountService],
})
export class EntityManagerModule {}
