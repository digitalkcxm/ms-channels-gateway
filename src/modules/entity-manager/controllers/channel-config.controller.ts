import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { CreateChannelConfigDto } from '@/modules/entity-manager/models/create-channel-config.dto';
import { UpdateChannelConfigDto } from '@/modules/entity-manager/models/update-channel-config.dto';

import { ChannelConfigService } from '../services/channel-config.service';

@Controller('manager/channel-configs')
export class ChannelConfigController {
  constructor(private readonly channelConfigService: ChannelConfigService) {}

  @Get()
  getAllChannelByCompany(@Headers('Authorization') companyToken: string) {
    return this.channelConfigService.getAllByCompany(companyToken);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.channelConfigService.getById(id);
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
