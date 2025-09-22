import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
  Patch,
} from '@nestjs/common';
import { QueryMedicalHistoryDto } from './dto/query-medical-history.dto';
import { MedicalHistoryService } from './history.service';
import { MedicalHistoryDto } from './dto/history.dto';

@Controller('medical-histories')
export class MedicalHistoryController {
  constructor(private readonly historyService: MedicalHistoryService) {}

  @Post()
  async create(@Body() dto: MedicalHistoryDto) {
    return await this.historyService.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryMedicalHistoryDto) {
    return await this.historyService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.historyService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MedicalHistoryDto,
  ) {
    return await this.historyService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.historyService.remove(id);
  }
}
