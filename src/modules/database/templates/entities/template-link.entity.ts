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

import { TemplateEntity } from './template.entity';

@Entity({ name: 'template_links' })
@Index('ix_template_links_template_id', (entity: TemplateLinkEntity) => [
  entity.templateId,
])
@Index('ix_template_links_reference_id', (entity: TemplateLinkEntity) => [
  entity.referenceId,
])
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
