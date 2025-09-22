import { Controller, Post, Body, Get, Param, Delete, Query, Patch } from '@nestjs/common';
import { DoctorDayOffService } from './doctor-day-off.service';
import { CreateDoctorDayOffDto } from './dto/create-doctor-off-day.dto';
import { QueryDoctorDayOffDto } from './dto/query-doctor-day-off.dto';
import { DoctorDayOffStatus } from 'src/common/enums/doctor-day-off-status.enum';

@Controller('doctor-off-days')
export class DoctorDayOffController {
  constructor(private readonly dayOffService: DoctorDayOffService) {}

  // Tạo ngày nghỉ mới
  @Post()
  create(@Body() dto: CreateDoctorDayOffDto) {
    return this.dayOffService.create(dto);
  }

  // Lấy tất cả ngày nghỉ của 1 bác sĩ
  @Get(':doctorId')
  findByDoctor(@Param('doctorId') doctorId: number) {
    return this.dayOffService.findByDoctor(doctorId);
  }

  // Xóa ngày nghỉ
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.dayOffService.remove(id);
  }

  // Admin: Lấy tất cả ngày nghỉ với filter
  @Get()
  findAll(@Query() query: QueryDoctorDayOffDto) {
    return this.dayOffService.findAll(query);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: number,
    @Body("status") status: DoctorDayOffStatus
  ) {
    return this.dayOffService.updateStatus(id, status);
  }
}
