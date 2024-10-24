import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { CreateChannelConfigDto } from '@/modules/entity-manager/channels-gateway/models/create-channel-config.dto';
import { UpdateChannelConfigDto } from '@/modules/entity-manager/channels-gateway/models/update-channel-config.dto';

import { ChannelConfigDto } from '../models/channel-config.dto';
import { ChannelConfigService } from '../services/channel-config.service';

@Controller('manager/channel-configs')
export class ChannelConfigController {
  constructor(private readonly channelConfigService: ChannelConfigService) {}

  @Get()
  getAllChannelByCompany(@Headers('Authorization') companyToken: string) {
    return this.channelConfigService.getAllByCompany(companyToken);
  }

  @Get('schema')
  getSchema() {
    return dtoToJsonSchema(ChannelConfigDto);
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Query('includeLinks', ParseBoolPipe) includeLinks = true,
  ) {
    return this.channelConfigService.getById(id, includeLinks);
  }

  @Post()
  create(
    @Headers('Authorization') companyToken: string,
    @Body() dto: CreateChannelConfigDto,
  ) {
    return this.channelConfigService.create(companyToken, dto);
  }

  @Put(':id')
  update(
    @Headers('Authorization') companyToken: string,
    @Param('id') id: string,
    @Body() dto: UpdateChannelConfigDto,
  ) {
    return this.channelConfigService.update(companyToken, id, dto);
  }

  @Delete(':id')
  delete(
    @Headers('Authorization') companyToken: string,
    @Param('id') id: string,
  ) {
    return this.channelConfigService.delete(companyToken, id);
  }
}
