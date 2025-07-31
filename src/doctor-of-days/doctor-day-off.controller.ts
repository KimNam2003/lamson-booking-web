import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { DoctorDayOffService } from './doctor-day-off.service';
import { CreateDoctorDayOffDto } from './dto/create-doctor-off-day.dto';

@Controller('doctor-day-off')
export class DoctorDayOffController {
  constructor(private readonly dayOffService: DoctorDayOffService) {}

  @Post()
  create(@Body() dto: CreateDoctorDayOffDto) {
    return this.dayOffService.create(dto);
  }

  @Get(':doctorId')
  findByDoctor(@Param('doctorId') doctorId: number) {
    return this.dayOffService.findByDoctor(doctorId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.dayOffService.remove(id);
  }
}
