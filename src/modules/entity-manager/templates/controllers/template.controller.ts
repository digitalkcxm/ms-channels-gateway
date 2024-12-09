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

import { CreateTemplateDto, TemplateDto, UpdateTemplateDto } from '../models';
import { TemplateService } from '../services';

@ApiSecurity('companyToken')
@Controller('manager/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  getAllByCompany(
    @CompanyToken() companyToken: string,
    @Query('referenceId') referenceId?: string,
  ) {
    return this.templateService.getAllByCompany(companyToken, referenceId);
  }

  @Get('schema')
  getSchema() {
    return dtoToJsonSchema(TemplateDto);
  }

  @Get(':id')
  @ApiQuery({ name: 'includeLinks', required: false, type: 'boolean' })
  getById(
    @Param('id') id: string,
    @Query('includeLinks', new ParseBoolPipe({ optional: true }))
    includeLinks = true,
  ) {
    return this.templateService.getById(id, includeLinks);
  }

  @Post()
  create(@CompanyToken() companyToken: string, @Body() dto: CreateTemplateDto) {
    return this.templateService.create(companyToken, dto);
  }

  @Put(':id')
  async update(
    @CompanyToken() companyToken: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    await this.templateService.update(companyToken, id, dto);
  }

  @Delete(':id')
  async delete(@CompanyToken() companyToken: string, @Param('id') id: string) {
    await this.templateService.delete(companyToken, id);
  }
}
