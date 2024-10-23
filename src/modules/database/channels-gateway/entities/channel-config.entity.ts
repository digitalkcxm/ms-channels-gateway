import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BrokerType, ChannelType } from '@/models/enums';

import { ChannelLinkEntity } from './channel-link.entity';
import { ChannelConfigStatus } from './enums';

@Entity({ name: 'channel_configs', schema: 'public' })
@Index('idx_channel_configs_company_token', (entity: ChannelConfigEntity) => [
  entity.companyToken,
])
export class ChannelConfigEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_channel_configs_id',
  })
  id: string;

  @Column()
  companyToken: string;

  @Column({ default: 'No name' })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enumName: 'channel_type',
    enum: ChannelType,
    foreignKeyConstraintName: 'fk_channel_configs_channel_type',
  })
  channel: ChannelType;

  @Column({
    type: 'enum',
    enumName: 'broker_type',
    enum: BrokerType,
    foreignKeyConstraintName: 'fk_channel_configs_broker_type',
  })
  broker: BrokerType;

  @Column({
    type: 'enum',
    enum: ChannelConfigStatus,
    enumName: 'channel_config_status',
    default: ChannelConfigStatus.DRAFT,
    foreignKeyConstraintName: 'fk_channel_configs_status',
  })
  status: ChannelConfigStatus;

  @OneToMany(() => ChannelLinkEntity, (entity) => entity.channelConfig, {
    cascade: true,
  })
  links: ChannelLinkEntity[];
}
