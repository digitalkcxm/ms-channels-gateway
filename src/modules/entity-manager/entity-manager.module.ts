import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/modules/database/database.module';
import { ChannelConfigController } from '@/modules/entity-manager/controllers/channel-config.controller';
import { ChannelLinkController } from '@/modules/entity-manager/controllers/channel-link.controller';
import { ChannelConfigService } from '@/modules/entity-manager/services/channel-config.service';
import { ChannelLinkService } from '@/modules/entity-manager/services/channel-link.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ChannelConfigController, ChannelLinkController],
  providers: [ChannelConfigService, ChannelLinkService],
})
export class EntityManagerModule {}
