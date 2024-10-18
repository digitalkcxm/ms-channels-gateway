import { OmitType } from '@nestjs/mapped-types';
import { DeepPartial } from 'typeorm';

import { RcsAccountEntity } from '@/modules/database/rcs/entities/rcs-account.entity';

import { ChatDto } from './chat.dto';
import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';

export class CreateChatDto extends OmitType(ChatDto, [
  'id',
  'createdAt',
  'updatedAt',
  'toEntity',
] as const) {
  toEntity(
    override?: DeepPartial<ChatDto | RcsAccountEntity>,
  ): DeepPartial<ChatEntity> {
    return {
      brokerChatId: this.brokerChatId,
      referenceChatId: this.referenceChatId,
      rcsAccountId: this.rcsAccountId,
      rcsAccount: this.rcsAccount?.toEntity(),
      ...override,
    };
  }
}
