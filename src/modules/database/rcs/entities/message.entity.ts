import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MessageDirection, MessageStatus } from '@/models/enums';

import { ChatEntity } from './chat.entity';

@Entity({ name: 'messages', schema: 'rcs' })
@Index('idx_messages_chat_id', (entity: MessageEntity) => [entity.chatId])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_messages_id',
  })
  id: string;

  @Column({ type: 'uuid' })
  chatId: string;

  @ManyToOne(() => ChatEntity, (entity) => entity.id, { cascade: true })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_messages_chat_id',
    name: 'chat_id',
    referencedColumnName: 'id',
  })
  chat?: ChatEntity;

  @Column({ nullable: true })
  brokerMessageId?: string;

  @Column({
    type: 'enum',
    enum: MessageDirection,
    enumName: 'message_direction',
    foreignKeyConstraintName: 'fk_messages_message_direction',
  })
  direction: MessageDirection;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    enumName: 'message_status',
    foreignKeyConstraintName: 'fk_messages_message_status',
    default: MessageStatus.QUEUED,
  })
  status: MessageStatus;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb' })
  rawMessage: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}