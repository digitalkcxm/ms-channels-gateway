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
import { ApiQuery } from '@nestjs/swagger';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { CreateChannelLinkDto } from '@/modules/entity-manager/channels-gateway/models/create-channel-link.dto';
import { UpdateChannelLinkDto } from '@/modules/entity-manager/channels-gateway/models/update-channel-link.dto';
import { ChannelLinkService } from '@/modules/entity-manager/channels-gateway/services/channel-link.service';

@Controller('manager/channel-links')
export class ChannelLinkController {
  constructor(private readonly channelLinkService: ChannelLinkService) {}

  @Get('schema')
  getSchema() {
    return dtoToJsonSchema(CreateChannelLinkDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.channelLinkService.getById(id);
  }

  @Get()
  @ApiQuery({ name: 'referenceId', type: 'string' })
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
