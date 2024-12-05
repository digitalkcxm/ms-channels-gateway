import { TemplateContentType } from '@/modules/database/templates/entities/enums';

import { BaseTemplateContentDto } from './base-template-content.dto';
import { TemplateActionItemDto } from './template-action-item.dto';

export class TemplateCarouselItemDto {
  title: string;
  description: string;
  imageUrl: string;
  actions: TemplateActionItemDto[];
}

export class TemplateCarouselContentDto implements BaseTemplateContentDto {
  readonly type = TemplateContentType.CAROUSEL;

  title: string;
  items: TemplateCarouselItemDto[];
}
