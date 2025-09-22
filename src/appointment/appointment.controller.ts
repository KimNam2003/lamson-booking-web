import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentService } from './services/appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';
import { RequestWithUser } from 'src/auth/types/types';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // 1. Bệnh nhân đặt lịch
  @Post()
  create(
    @Body() dto: CreateAppointmentDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user) throw new UnauthorizedException();

    return this.appointmentService.createAppointment(dto, req.user);
  }

  // 2. Lấy danh sách lịch hẹn (lọc theo status nếu cần)
  @Get()
  getAppointments(
    @Req() req: RequestWithUser,
    @Query('status') status?: AppointmentStatus,
    @Query('patientId') patientId?: string,

  ) {
    if (!req.user) throw new UnauthorizedException();
    const numericPatientId = patientId ? +patientId : undefined;
    return this.appointmentService.findAll(req.user, status, numericPatientId);
  }  

  // 3. Lấy chi tiết 1 appointment
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findOne(id);
  }

  // 4. Bác sĩ cập nhật trạng thái
  @Patch(':id/status')
    updateStatus(
      @Param('id', ParseIntPipe) id: number,
      @Body('status') status: AppointmentStatus,
      @Req() req: RequestWithUser,
    ) {
      if (!req.user) throw new UnauthorizedException();

      return this.appointmentService.updateStatus(id, status, req.user);
    }

  @Patch(':id/slot')
    reschedule(
      @Param('id', ParseIntPipe) id: number,
      @Body('newSlotId', ParseIntPipe) newSlotId: number,
      @Req() req: RequestWithUser,
    ) {
      if (!req.user) throw new UnauthorizedException();
      return this.appointmentService.rescheduleAppointment(id, newSlotId, req.user);
    }
}
