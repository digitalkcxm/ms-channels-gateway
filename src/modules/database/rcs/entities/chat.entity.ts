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

import { RcsAccountEntity } from './rcs-account.entity';

@Entity({ name: 'chats', schema: 'rcs' })
@Index('idx_chats_rcs_broker_chat_id', (entity: ChatEntity) => [
  entity.brokerChatId,
])
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_chats_id',
  })
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
