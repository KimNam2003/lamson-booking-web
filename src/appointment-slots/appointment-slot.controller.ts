import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AppointmentSlotService } from './appointment-slot.service';
import { GenerateSlotDto } from './dto/appointment-slot.dto';

@Controller('appointment-slots')
export class AppointmentSlotController {
  constructor(private readonly slotService: AppointmentSlotService) {}

  @Post('generate')
  generateSlots(@Body() dto: GenerateSlotDto) {
    return this.slotService.generateSlots(dto.doctorId, dto.serviceId, dto.date);
  }

  @Get()
  findAll(@Query('doctorId', ParseIntPipe) doctorId?: number) {
    return this.slotService.findAll(doctorId);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.slotService.delete(id);
  }
}
