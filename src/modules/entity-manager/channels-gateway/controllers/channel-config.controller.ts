import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiSecurity } from '@nestjs/swagger';

import { CompanyToken } from '@/config/company-token.decorator';
import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { CreateChannelConfigDto } from '@/modules/entity-manager/channels-gateway/models/create-channel-config.dto';
import { UpdateChannelConfigDto } from '@/modules/entity-manager/channels-gateway/models/update-channel-config.dto';

import { ChannelConfigDto } from '../models/channel-config.dto';
import { ChannelConfigService } from '../services/channel-config.service';

@ApiSecurity('companyToken')
@Controller('manager/channel-configs')
export class ChannelConfigController {
  constructor(private readonly channelConfigService: ChannelConfigService) {}

  @Get()
  getAllChannelByCompany(@CompanyToken() companyToken: string) {
    return this.channelConfigService.getAllByCompany(companyToken);
  }

  @Get('schema')
  getSchema() {
    return dtoToJsonSchema(ChannelConfigDto);
  }

  @Get(':id')
  @ApiQuery({ name: 'includeLinks', required: false, type: 'boolean' })
  getById(
    @Param('id') id: string,
    @Query('includeLinks', new ParseBoolPipe({ optional: true }))
    includeLinks = true,
  ) {
    return this.channelConfigService.getById(id, includeLinks);
  }

  @Post()
  create(
    @CompanyToken() companyToken: string,
    @Body() dto: CreateChannelConfigDto,
  ) {
    return this.channelConfigService.create(companyToken, dto);
  }

  @Put(':id')
  async update(
    @CompanyToken() companyToken: string,
    @Param('id') id: string,
    @Body() dto: UpdateChannelConfigDto,
  ) {
    await this.channelConfigService.update(companyToken, id, dto);
  }

  @Delete(':id')
  async delete(@CompanyToken() companyToken: string, @Param('id') id: string) {
    await this.channelConfigService.delete(companyToken, id);
  }
}
