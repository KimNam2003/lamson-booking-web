import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceDto } from './dto/service.dto';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // GET /services
  @Get()
  async findAll(): Promise<Service[]> {
    return this.serviceService.findAll();
  }

  // GET /services/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Service> {
    return this.serviceService.findOne(id);
  }

  // POST /services
  @Post()
  async create(@Body() serviceDto: ServiceDto): Promise<Service> {
    return this.serviceService.create(serviceDto);
  }

  // PATCH /services/:id
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() serviceDto: ServiceDto
  ): Promise<Service> {
    return this.serviceService.update(id, serviceDto);
  }

  // DELETE /services/:id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.serviceService.remove(id);
  }
}
