import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MessageEntity } from './message.entity';
import { RcsAccountEntity } from './rcs-account.entity';

@Entity({ name: 'chats', schema: 'rcs' })
@Index('idx_chats_rcs_broker_chat_id', (entity: ChatEntity) => [
  entity.brokerChatId,
])
@Index('idx_chats_reference_chat_id', (entity: ChatEntity) => [
  entity.referenceChatId,
])
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_chats_id',
  })
  id: string;

  @Column()
  referenceChatId: string;

  @Column({ nullable: true })
  rcsAccountId?: string;

  @ManyToOne(() => RcsAccountEntity, (entity) => entity.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_chats_rcs_account_id',
    name: 'rcs_account_id',
    referencedColumnName: 'id',
  })
  rcsAccount?: RcsAccountEntity;

  @Column({ nullable: true })
  brokerChatId?: string;

  @OneToMany(() => MessageEntity, (entity) => entity.chat)
  messages?: MessageEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
