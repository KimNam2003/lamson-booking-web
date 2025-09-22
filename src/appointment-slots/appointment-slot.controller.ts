import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
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

    @Get('by-date')
    async findSlotsByDate(
    @Query('scheduleId', ParseIntPipe) scheduleId: number,
    @Query('serviceId', ParseIntPipe) serviceId: number,
    @Query('date') date: string,
  ) {
    if (!date) {
      throw new BadRequestException('Query parameter "date" is required');
    }
    return this.slotService.findSlotsByDate(scheduleId, serviceId, date);
  }

  @Patch(':id/active')
  async setActive(
  @Param('id') id: number,
  @Body('isActive') isActive: boolean
) {
  return this.slotService.updateIsActive(id, isActive);
}


  // ❌ Xóa slot theo ID
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.slotService.delete(id);
  }
}