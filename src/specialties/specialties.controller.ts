import {Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpecialtiesService } from './specialties.service';
import { SpecialtyDto } from './dto/specialty.dto';
import { Specialty } from './entities/specialty.entity';
import { Service } from 'src/services/entities/service.entity';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  // Tạo mới chuyên khoa (hỗ trợ upload ảnh)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: SpecialtyDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Specialty> {
    return this.specialtiesService.create(dto, image);
  }

  // Lấy danh sách tất cả chuyên khoa
  @Get()
  findAll(): Promise<Specialty[]> {
    return this.specialtiesService.findAll();
  }

  // Lấy chi tiết 1 chuyên khoa
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Specialty> {
    return this.specialtiesService.findOne(id);
  }

  // Cập nhật chuyên khoa (hỗ trợ upload ảnh)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SpecialtyDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Specialty> {
    return this.specialtiesService.update(id, dto, image);
  }

  // Xoá chuyên khoa
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.specialtiesService.remove(id);
  }

  // Lấy danh sách dịch vụ theo chuyên khoa
  @Get(':id/services')
  getServices(@Param('id', ParseIntPipe) id: number): Promise<Service[]> {
    return this.specialtiesService.getServicesBySpecialtyId(id);
  }
}
