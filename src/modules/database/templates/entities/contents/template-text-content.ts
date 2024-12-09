import { BaseTemplateContent } from './base-template-content';

import { TemplateContentType } from '../enums';

export class TemplateTextContent implements BaseTemplateContent {
  readonly type = TemplateContentType.TEXT;

  text: string;
}
