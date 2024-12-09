import { BaseTemplateContent } from './base-template-content';
import { TemplateActionItem } from './template-action-item';

import { TemplateContentType } from '../enums';

export class TemplateRichCardContent implements BaseTemplateContent {
  readonly type = TemplateContentType.RICH_CARD;

  title: string;
  description: string;
  imageUrl: string;
  actions: TemplateActionItem[];
}
