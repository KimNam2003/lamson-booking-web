import { Controller, Post, Body, Get, Param, Patch, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleDto } from './dto/schedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() dto: ScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @Get()
  getSchedulesByDoctorId(
    @Query('doctorId', ParseIntPipe) doctorId?: number,
  ) {
    return this.scheduleService.findAllScheduleByDoctorId(doctorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ScheduleDto) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}
