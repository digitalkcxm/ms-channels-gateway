import { TemplateActionItemType } from '@/modules/database/templates/entities';

export class TemplateActionItemDto {
  type: TemplateActionItemType;
  text: string;
  value: string;
}
