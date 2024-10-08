import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './modules/database/database.module';
import { EntityManagerModule } from './modules/entity-manager/entity-manager.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EntityManagerModule,
    MessageModule,
  ],
})
export class AppModule {}
