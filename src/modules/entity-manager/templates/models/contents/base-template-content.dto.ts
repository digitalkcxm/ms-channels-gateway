import { TemplateContentType } from '@/modules/database/templates/entities/enums';

export abstract class BaseTemplateContentDto {
  abstract type: TemplateContentType;
}
