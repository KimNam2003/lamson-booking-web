import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpecialtiesService } from './specialties.service';
import { SpecialtyDto } from './dto/specialty.dto';
import { ListSpecialtyQueryDto } from './dto/specialty-query-dto';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  // ✅ [POST] /specialties - Tạo chuyên khoa mới
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: SpecialtyDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.specialtiesService.create(dto, image);
  }

  // ✅ [GET] /specialties - Lấy danh sách chuyên khoa có lọc và phân trang
  @Get()
  async findSpecialties(@Query() query: ListSpecialtyQueryDto) {
    return this.specialtiesService.findSpecialties(query);
  }

  // ✅ [PUT] /specialties/:id - Cập nhật chuyên khoa
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SpecialtyDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.specialtiesService.update(id, dto, image);
  }

  // ✅ [DELETE] /specialties/:id - Xoá chuyên khoa
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.specialtiesService.remove(id);
  }
}
