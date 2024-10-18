import { IsDate, IsEmpty, IsUUID } from 'class-validator';
import { DeepPartial } from 'typeorm';

import { ChatEntity } from '@/modules/database/rcs/entities/chat.entity';
import { RcsAccountEntity } from '@/modules/database/rcs/entities/rcs-account.entity';

import { RcsAccountDto } from './rcs-account.dto';

export class ChatDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsUUID()
  rcsAccountId?: string;

  @IsUUID()
  rcsAccount?: RcsAccountDto;

  @IsUUID()
  brokerChatId: string;

  @IsUUID()
  referenceChatId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  toEntity(
    override?: DeepPartial<ChatDto | RcsAccountEntity>,
  ): DeepPartial<ChatEntity> {
    return {
      id: this.id,
      brokerChatId: this.brokerChatId,
      referenceChatId: this.referenceChatId,
      rcsAccountId: this.rcsAccountId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      rcsAccount: this.rcsAccount?.toEntity(),
      ...override,
    };
  }

  static fromEntity(entity: DeepPartial<ChatEntity>): ChatDto {
    if (!entity) {
      return null;
    }

    const dto = new ChatDto();

    dto.id = entity.id;
    dto.brokerChatId = entity.brokerChatId;
    dto.referenceChatId = entity.referenceChatId,
    dto.rcsAccountId = entity.rcsAccountId;
    dto.createdAt = entity.createdAt as Date;
    dto.updatedAt = entity.updatedAt as Date;
    dto.rcsAccount = RcsAccountDto.fromEntity(entity.rcsAccount);

    return dto;
  }
}
