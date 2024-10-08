import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CreateChannelLinkDto } from '@/modules/entity-manager/models/create-channel-link.dto';
import { UpdateChannelLinkDto } from '@/modules/entity-manager/models/update-channel-link.dto';
import { ChannelLinkService } from '@/modules/entity-manager/services/channel-link.service';

@Controller('manager/channel-links')
export class ChannelLinkController {
  constructor(private readonly channelLinkService: ChannelLinkService) {}

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.channelLinkService.getById(id);
  }

  @Get()
  getAllByReference(@Query('referenceId') referenceId: string) {
    return this.channelLinkService.getAllByReference(referenceId);
  }

  @Post()
  create(@Body() entity: CreateChannelLinkDto) {
    return this.channelLinkService.create(entity);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() entity: UpdateChannelLinkDto) {
    return this.channelLinkService.update(id, entity);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.channelLinkService.delete(id);
  }
}
