import {Controller, Post, Body, Get, Query, Param, Patch, ParseIntPipe,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // 🔹 Đặt lịch hẹn
  @Post()
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(dto);
  }

  // 🔹 Lấy danh sách lịch hẹn (lọc theo bệnh nhân hoặc bác sĩ)
  @Get()
  async findAll(
    @Query('patientId') patientId?: number,
    @Query('doctorId') doctorId?: number,
  ) {
    return this.appointmentService.findAll(patientId, doctorId);
  }

  // 🔹 Cập nhật trạng thái lịch hẹn
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentService.updateStatus(id, dto.status);
  }
}
