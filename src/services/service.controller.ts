import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator';
import { ServiceService } from './service.service';
import { ServiceDto } from './dto/service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // ✅ GET /services?serviceId=...&specialtyId=...&doctorId=...
  @Get()
  async findServices(@Query() query: ServiceQueryDto): Promise<Service[]> {
    return this.serviceService.findServices(query);
  }

  // ✅ POST /services
  @Post()
  async createService(@Body() serviceDto: ServiceDto): Promise<Service> {
    return this.serviceService.create(serviceDto);
  }

  // ✅ PATCH /services/:id
  @Patch(':id')
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() serviceDto: ServiceDto,
  ): Promise<Service> {
    return this.serviceService.update(id, serviceDto);
  }

  // ✅ DELETE /services/:id
  @Delete(':id')
  async deleteService(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.serviceService.remove(id);
  }

  // ✅ POST /services/:id/doctors
  @Post(':id/doctors')
  async assignDoctorsToService(
    @Param('id', ParseIntPipe) serviceId: number,
    @Body() body: { doctorIds: number[] },
  ) {
    return this.serviceService.assignDoctorsToService(serviceId, body.doctorIds);
  }

}
