import { BaseTemplateContent } from './base-template-content';
import { TemplateActionItem } from './template-action-item';

import { TemplateContentType } from '../enums';

export class TemplateCarouselItem {
  title: string;
  description: string;
  imageUrl: string;
  actions: TemplateActionItem[];
}

export class TemplateCarouselContent implements BaseTemplateContent {
  readonly type = TemplateContentType.CAROUSEL;

  title: string;
  items: TemplateCarouselItem[];
}
