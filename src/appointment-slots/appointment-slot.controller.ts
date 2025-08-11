import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AppointmentSlotService } from './appointment-slot.service';
import { GenerateSlotDto } from './dto/appointment-slot.dto';
@Controller('appointment-slots')
export class AppointmentSlotController {
  constructor(private readonly slotService: AppointmentSlotService) {}

  // 🔄 Tạo slot
  @Post()
  async generate(@Body() dto: GenerateSlotDto) {
    return this.slotService.generateSlots(dto);
  }

  // 📄 Lấy tất cả slot (lọc theo doctor nếu có)
  @Get()
  async findAll(@Query('doctorId') doctorId?: string) {
    return this.slotService.findAll(doctorId ? Number(doctorId) : undefined);
  }

    @Get('schedule/:scheduleId/date/:date')
    async findSlotsByDate(
      @Param('scheduleId', ParseIntPipe) scheduleId: number,
      @Param('date') date: string,
    ) {
      return this.slotService.findSlotsByDate(scheduleId, date);
    }

  // ❌ Xóa slot theo ID
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.slotService.delete(id);
  }
}