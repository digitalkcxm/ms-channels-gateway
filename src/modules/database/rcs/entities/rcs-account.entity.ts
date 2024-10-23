import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BrokerType } from '@/models/enums';

import { PontalTechRcsAccountEntity } from './pontal-tech-rcs-account.entity';

@Entity({ name: 'rcs_accounts', schema: 'rcs' })
@Index('idx_rcs_account_reference_id', (entity: RcsAccountEntity) => [
  entity.referenceId,
])
export class RcsAccountEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_rcs_accounts_id',
  })
  id: string;

  @Column()
  referenceId: string;

  @Column()
  broker: BrokerType;

  @OneToOne(() => PontalTechRcsAccountEntity, (entity) => entity.rcsAccount, {
    cascade: true,
  })
  pontalTechRcsAccount?: PontalTechRcsAccountEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
