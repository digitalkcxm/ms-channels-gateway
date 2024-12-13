import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelConfigEntity } from './channels-gateway/entities/channel-config.entity';
import { ChannelLinkEntity } from './channels-gateway/entities/channel-link.entity';
import { ChannelConfigRepository } from './channels-gateway/repositories/channel-config.repository';
import { ChannelLinkRepository } from './channels-gateway/repositories/channel-link.repository';
import { ChatEntity } from './rcs/entities/chat.entity';
import { MessageEntity } from './rcs/entities/message.entity';
import { PontalTechRcsAccountEntity } from './rcs/entities/pontal-tech-rcs-account.entity';
import { RcsAccountEntity } from './rcs/entities/rcs-account.entity';
import { ChatRepository } from './rcs/repositories/chat.repository';
import { MessageRepository } from './rcs/repositories/message.repository';
import { RcsAccountRepository } from './rcs/repositories/rcs-account.repository';
import { TemplateEntity, TemplateLinkEntity } from './templates/entities';
import {
  TemplateLinkRepository,
  TemplateRepository,
} from './templates/repositories';
import { TypeOrmConfigService } from './type-orm-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([
      ChannelConfigEntity,
      ChannelLinkEntity,
      ChatEntity,
      MessageEntity,
      PontalTechRcsAccountEntity,
      RcsAccountEntity,
      TemplateEntity,
      TemplateLinkEntity,
    ]),
  ],
  providers: [
    ChannelConfigRepository,
    ChannelLinkRepository,
    ChatRepository,
    MessageRepository,
    RcsAccountRepository,
    TemplateRepository,
    TemplateLinkRepository,
  ],
  exports: [
    ChannelConfigRepository,
    ChannelLinkRepository,
    ChatRepository,
    MessageRepository,
    RcsAccountRepository,
    TemplateRepository,
    TemplateLinkRepository,
  ],
})
export class DatabaseModule {}
