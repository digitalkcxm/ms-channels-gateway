import { Type } from 'class-transformer';
import {
  IsIn,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';

import { BaseRcsMessageContentDto } from './base-rcs-message-content.dto';
import {
  RcsMessageActionType,
  RcsMessageActionTypes,
} from './rcs-message-action-type';
import { RcsMessageType } from './rcs-message-type';

export abstract class BaseRcsActionItemDto {
  @IsIn(RcsMessageActionTypes)
  abstract type: RcsMessageActionType;

  @IsString()
  @MaxLength(25)
  title: string;
}

export class RcsActionItemOpenUrlDto extends BaseRcsActionItemDto {
  readonly type: RcsMessageActionType = 'openUrl';

  @IsUrl()
  value: string;
}

export class RcsActionItemCallDto extends BaseRcsActionItemDto {
  readonly type: RcsMessageActionType = 'call';

  @IsString()
  value: string;
}

export class RcsActionItemReplyDto extends BaseRcsActionItemDto {
  readonly type: RcsMessageActionType = 'reply';

  @IsString()
  value: string;
}

export class RcsMessageActionContentDto extends BaseRcsMessageContentDto {
  readonly messageType: RcsMessageType = 'actions';

  @IsString()
  @MaxLength(2000)
  title: string;

  @ValidateNested()
  @JSONSchema({
    oneOf: [
      dtoToJsonSchema(RcsActionItemOpenUrlDto),
      dtoToJsonSchema(RcsActionItemCallDto),
      dtoToJsonSchema(RcsActionItemReplyDto),
    ],
  })
  @Type(() => BaseRcsActionItemDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: RcsActionItemOpenUrlDto, name: 'openUrl' },
        { value: RcsActionItemCallDto, name: 'call' },
        { value: RcsActionItemReplyDto, name: 'reply' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  actions: (
    | RcsActionItemOpenUrlDto
    | RcsActionItemCallDto
    | RcsActionItemReplyDto
  )[];
}

export class RcsMessageActionCallbackDto {
  readonly type = 'rcs';
  readonly messageType = 'action-callback';

  callback: {
    value: string;
    title: string;
    type: RcsMessageActionType;
  };
}
