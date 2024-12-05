import { TemplateContentType } from '@/modules/database/templates/entities/enums';

import { BaseTemplateContentDto } from './base-template-content.dto';

export class TemplateTextContentDto implements BaseTemplateContentDto {
  readonly type = TemplateContentType.TEXT;

  text: string;
}
