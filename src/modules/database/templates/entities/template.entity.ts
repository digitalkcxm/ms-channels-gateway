import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ChannelType } from '@/models/enums';

import { TemplateCarouselContent } from './contents/template-carousel-content';
import { TemplateRichCardContent } from './contents/template-rich-card-content';
import { TemplateTextContent } from './contents/template-text-content';
import { TemplateContentType } from './enums';
import { TemplateLinkEntity } from './template-link.entity';

@Entity({ name: 'templates' })
@Index('ix_templates_channel', (entity: TemplateEntity) => [entity.channel])
@Index('ix_templates_content_type', (entity: TemplateEntity) => [
  entity.contentType,
])
@Index('ix_templates_company_token', (entity: TemplateEntity) => [
  entity.companyToken,
])
export class TemplateEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_templates_id',
  })
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  companyToken: string;

  @Column({ nullable: true })
  externalId?: string;

  @Column({
    type: 'enum',
    enumName: 'channel_type',
    enum: ChannelType,
    foreignKeyConstraintName: 'fk_templates_channel_type',
  })
  channel: ChannelType;

  @Column({
    type: 'enum',
    enumName: 'template_content_type',
    enum: TemplateContentType,
    foreignKeyConstraintName: 'fk_templates_template_content_type',
  })
  contentType: TemplateContentType;

  @Column({ type: 'jsonb' })
  content:
    | TemplateTextContent
    | TemplateRichCardContent
    | TemplateCarouselContent;

  @Column({ type: 'jsonb', nullable: true })
  variables?: string[];

  @OneToMany(() => TemplateLinkEntity, (entity) => entity.template, {
    cascade: true,
  })
  links: TemplateLinkEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
