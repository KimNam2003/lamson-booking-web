import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtyDto } from './dto/specialty.dto';
import { Specialty } from './entities/specialty.entity';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  // Tạo mới chuyên khoa
  @Post()
  async create(@Body() specialtyDto: SpecialtyDto): Promise<Specialty> {
    return this.specialtiesService.create(specialtyDto);
  }

  // Lấy danh sách tất cả chuyên khoa
  @Get()
  async findAll(): Promise<Specialty[]> {
    return this.specialtiesService.findAll();
  }

  // Lấy 1 chuyên khoa theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Specialty> {
    return this.specialtiesService.findOne(id);
  }

  // Cập nhật chuyên khoa
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() specialtyDto: SpecialtyDto,
  ): Promise<Specialty> {
    return this.specialtiesService.update(id, specialtyDto);
  }

  // Xoá chuyên khoa
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.specialtiesService.remove(id);
  }
}
