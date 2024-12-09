import { TemplateContentType } from '@/modules/database/templates/entities/enums';

import { BaseTemplateContentDto } from './base-template-content.dto';
import { TemplateActionItemDto } from './template-action-item.dto';

export class TemplateRichCardContentDto implements BaseTemplateContentDto {
  readonly type = TemplateContentType.RICH_CARD;

  title: string;
  description: string;
  imageUrl: string;
  actions: TemplateActionItemDto[];
}
