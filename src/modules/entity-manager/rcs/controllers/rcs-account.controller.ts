import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { dtoToJsonSchema } from '@/helpers/dto-to-json-schema.helper';
import { BrokerType } from '@/models/enums';

import { CreateRcsAccountDto } from '../models/create-rcs-account.dto';
import { RcsAccountDto } from '../models/rcs-account.dto';
import { UpdateRcsAccountDto } from '../models/update-rcs-account.dto';
import { RcsAccountService } from '../services/rcs-account.service';

@Controller('manager/rcs-accounts')
export class RcsAccountController {
  constructor(private readonly rcsAccountService: RcsAccountService) {}

  @Get('schema')
  getSchema() {
    return dtoToJsonSchema(RcsAccountDto);
  }

  @Get('reference/:referenceId')
  @ApiQuery({ name: 'broker', type: 'enum', enum: BrokerType })
  getByReference(
    @Param('id') referenceId: string,
    @Query('broker', new ParseEnumPipe(BrokerType)) broker: BrokerType,
  ) {
    const brokerType = broker;
    return this.rcsAccountService.getByReference(referenceId, brokerType);
  }

  @Get(':id')
  @ApiQuery({ name: 'broker', type: 'enum', enum: BrokerType })
  getById(
    @Param('id') id: string,
    @Query('broker', new ParseEnumPipe(BrokerType)) broker: BrokerType,
  ) {
    return this.rcsAccountService.getById(id, broker);
  }

  @Post()
  create(@Body() dto: CreateRcsAccountDto) {
    return this.rcsAccountService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRcsAccountDto) {
    this.rcsAccountService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.rcsAccountService.delete(id);
  }
}
