import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { TemplateEntity } from './template.entity';

@Entity({ name: 'template_links' })
@Index('ix_template_links_template_id', (entity: TemplateLinkEntity) => [
  entity.templateId,
])
@Index('ix_template_links_reference_id', (entity: TemplateLinkEntity) => [
  entity.referenceId,
])
@Unique(
  'uq_template_links_template_id_reference_id',
  (entity: TemplateLinkEntity) => [entity.referenceId, entity.templateId],
)
export class TemplateLinkEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_template_links_id',
  })
  id: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @ManyToOne(() => TemplateEntity, (entity) => entity.links)
  @JoinColumn({
    name: 'template_id',
    foreignKeyConstraintName: 'fk_template_links_template_id',
    referencedColumnName: 'id',
  })
  template: TemplateEntity;

  @Column()
  referenceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
