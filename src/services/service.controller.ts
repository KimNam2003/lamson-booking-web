// service.controller.ts
import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { ServiceDto } from './dto/service.dto';
import { ServiceService } from './service.service';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  create(@Body() serviceDto: ServiceDto) {
    return this.serviceService.create(serviceDto);
  }

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(+id); // ép kiểu vì transform: true đã bật
  }

  @Delete(':id')  
  remove(@Param('id') id: string) {
    return this.serviceService.remove(+id);
  }
}
