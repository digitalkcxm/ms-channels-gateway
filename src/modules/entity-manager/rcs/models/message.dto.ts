import { getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmpty,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { DeepPartial } from 'typeorm';

import { MessageDirection, MessageStatus } from '@/models/enums';
import { MessageEntity } from '@/modules/database/rcs/entities/message.entity';

import { ChatDto } from './chat.dto';

@JSONSchema({
  $ref: getSchemaPath(MessageDto),
})
export class MessageDto {
  @IsUUID()
  @IsEmpty()
  id: string;

  @IsUUID()
  chatId: string;

  @ValidateNested()
  @Type(() => ChatDto)
  @IsOptional()
  chat?: ChatDto;

  @IsUUID()
  brokerMessageId?: string;

  @IsString()
  referenceMessageId?: string;

  @IsString()
  recipient: string;

  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @IsEnum(MessageStatus)
  status: MessageStatus;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsObject()
  rawMessage: any;

  @IsDate()
  @IsOptional()
  receivedAt: Date;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  toEntity(override?: DeepPartial<MessageDto>): DeepPartial<MessageEntity> {
    return {
      id: this.id,
      chatId: this.chatId,
      chat: this.chat,
      brokerMessageId: this.brokerMessageId,
      referenceMessageId: this.referenceMessageId,
      recipient: this.recipient,
      direction: this.direction,
      status: this.status,
      errorMessage: this.errorMessage,
      rawMessage: this.rawMessage,
      receivedAt: this.receivedAt || this.createdAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...override,
    };
  }

  static fromEntity(entity: DeepPartial<MessageEntity>): MessageDto {
    if (!entity) {
      return null;
    }

    const dto = new MessageDto();

    dto.id = entity.id;
    dto.chatId = entity.chatId;
    dto.chat = ChatDto.fromEntity(entity.chat);
    dto.brokerMessageId = entity.brokerMessageId;
    dto.referenceMessageId = entity.referenceMessageId;
    dto.recipient = entity.recipient;
    dto.direction = entity.direction;
    dto.status = entity.status;
    dto.errorMessage = entity.errorMessage;
    dto.rawMessage = entity.rawMessage;
    dto.receivedAt = (entity.receivedAt || entity.createdAt) as Date;
    dto.createdAt = entity.createdAt as Date;
    dto.updatedAt = entity.updatedAt as Date;

    return dto;
  }
}
