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

import { CompanyToken } from '@/config/company-token.decorator';
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
  getAllByReference(
    @CompanyToken() companyToken: string,
    @Query('referenceId') referenceId: string,
  ) {
    return this.channelLinkService.getAllByReference(companyToken, referenceId);
  }

  @Post()
  create(@Body() entity: CreateChannelLinkDto) {
    return this.channelLinkService.create(entity);
  }

  @Put(':id')
  async update(
    @CompanyToken() companyToken: string,
    @Param('id') id: string,
    @Body() entity: UpdateChannelLinkDto,
  ) {
    await this.channelLinkService.update(companyToken, id, entity);
  }

  @Delete(':id')
  async delete(@CompanyToken() companyToken: string, @Param('id') id: string) {
    await this.channelLinkService.delete(companyToken, id);
  }
}
