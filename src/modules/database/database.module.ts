import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelConfigEntity } from './entities/channel-config.entity';
import { ChannelLinkEntity } from './entities/channel-link.entity';
import { ChannelConfigRepository } from './repositories/channel-config.repository';
import { ChannelLinkRepository } from './repositories/channel-link.repository';
import { TypeOrmConfigService } from './type-orm-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([ChannelConfigEntity, ChannelLinkEntity]),
  ],
  providers: [ChannelConfigRepository, ChannelLinkRepository],
  exports: [ChannelConfigRepository, ChannelLinkRepository],
})
export class DatabaseModule {}
