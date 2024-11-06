import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { OutboundMessageDto } from '@/models/outbound-message.model';

import { OutboundMessageService } from './services/outbound-message.service';

import { MessageService } from '../entity-manager/rcs/services/message.service';

@Controller('messages')
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
