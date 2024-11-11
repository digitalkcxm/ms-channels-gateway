import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@/helpers/api-paginated-response.decorator';
import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { BaseMessageDto } from '@/models/outbound-base.model';
import { OutboundMessageDto } from '@/models/outbound-message.dto';
import { PaginatedDto } from '@/models/paginated.dto';
import { RcsMessageDto } from '@/models/rsc-message.dto';

import { OutboundMessageService } from './services/outbound-message.service';

import { MessageDto } from '../entity-manager/rcs/models/message.dto';
import { MessageService } from '../entity-manager/rcs/services/message.service';

@Controller('messages')
@ApiExtraModels(
  () => PaginatedDto,
  () => BaseMessageDto,
  () => RcsMessageDto,
  OutboundMessageDto,
)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly outboundMessageService: OutboundMessageService,
  ) {}

  @Post('publish')
  async publish(
    @Body()
    body: OutboundMessageDto,
  ) {
    await this.outboundMessageService.publish(body);
  }

  @Get('publish/schema')
  async schema() {
    return dtoToJsonSchema(OutboundMessageDto);
  }

  @Get()
  @ApiPaginatedResponse(MessageDto)
  async byReferenceChat(
    @Query('referenceChatId') referenceChatId: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    return await this.messageService.getPagedByReferenceChat(
      referenceChatId,
      offset,
      limit,
    );
  }
}
