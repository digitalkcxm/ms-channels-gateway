import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ChannelConfigEntity } from './channel-config.entity';
import { ChannelDirection } from './enums';

@Entity({ name: 'channel_links', schema: 'public' })
@Index('idx_channel_links_reference_id', (entity: ChannelLinkEntity) => [
  entity.referenceId,
])
export class ChannelLinkEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_channel_links_id',
  })
  id: string;

  @Column()
  referenceId: string;

  @Column({
    type: 'enum',
    enum: ChannelDirection,
    enumName: 'channel_direction',
    default: ChannelDirection.BOTH,
  })
  direction: ChannelDirection;

  @Column({ type: 'uuid' })
  channelConfigId: string;

  @ManyToOne(() => ChannelConfigEntity, (entity) => entity.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_channel_links_channel_config_id',
    name: 'channel_config_id',
    referencedColumnName: 'id',
  })
  channelConfig: ChannelConfigEntity;
}
