import { Body, Controller, Post } from '@nestjs/common';

import { OutboundMessageDto } from '@/models/outbound-message.model';

import { MessageService } from './services/message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('publish')
  async publish(
    @Body()
    body: OutboundMessageDto,
  ) {
    await this.messageService.publish(body);
  }
}
