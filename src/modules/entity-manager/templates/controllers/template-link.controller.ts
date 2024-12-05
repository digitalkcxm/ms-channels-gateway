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

import { CreateTemplateLinkDto, UpdateTemplateLinkDto } from '../models';
import { TemplateLinkService } from '../services';

@Controller('manager/templates/:templateId/links')
export class TemplateLinkController {
  constructor(private readonly templateService: TemplateLinkService) {}

  @Get('schema')
  getSchema() {
    return dtoToJsonSchema(CreateTemplateLinkDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.templateService.getById(id);
  }

  @Get()
  @ApiQuery({ name: 'referenceId', type: 'string' })
  getAllByReference(
    @CompanyToken() companyToken: string,
    @Query('referenceId') referenceId: string,
  ) {
    return this.templateService.getAllByReference(companyToken, referenceId);
  }

  @Post()
  create(@Body() entity: CreateTemplateLinkDto) {
    return this.templateService.create(entity);
  }

  @Put(':id')
  async update(
    @CompanyToken() companyToken: string,
    @Param('id') id: string,
    @Body() entity: UpdateTemplateLinkDto,
  ) {
    await this.templateService.update(companyToken, id, entity);
  }

  @Delete(':id')
  async delete(@CompanyToken() companyToken: string, @Param('id') id: string) {
    await this.templateService.delete(companyToken, id);
  }
}
