import { IsMimeType, IsOptional, IsString, IsUrl } from 'class-validator';

import { BaseRcsMessageContentDto } from './base-rcs-message-content.dto';
import { RcsMessageType } from './rcs-nessage-type';

export class RcsMessageDocumentContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'document';

  @IsUrl()
  url: string;

  @IsMimeType()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}
