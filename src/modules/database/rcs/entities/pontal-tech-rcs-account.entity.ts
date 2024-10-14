import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { RcsAccountEntity } from './rcs-account.entity';

@Entity({ name: 'pontal_tech_rcs_accounts', schema: 'rcs' })
@Index(
  'idx_pontal_tech_rcs_account_reference_id',
  (entity: PontalTechRcsAccountEntity) => [entity.rcsAccountId],
)
export class PontalTechRcsAccountEntity {
  @PrimaryColumn({
    type: 'uuid',
    primaryKeyConstraintName: 'pk_pontal_tech_rcs_accounts_rcs_account_id',
  })
  @Unique(
    'uq_pontal_tech_rcs_account_rcs_account_id',
    (entity: PontalTechRcsAccountEntity) => [entity.rcsAccountId],
  )
  rcsAccountId: string;

  @OneToOne(() => RcsAccountEntity, (entity) => entity.id)
  @JoinColumn({
    name: 'rcs_account_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_pontal_tech_rcs_account_rcs_accounts_id',
  })
  rcsAccount: RcsAccountEntity;

  @Column()
  apiKey: string;

  @Column()
  pontalTechAccountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
