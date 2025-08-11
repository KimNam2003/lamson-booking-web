import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  Query,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorDto } from './dto/doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ListDoctorQueryDto } from './dto/doctor-query-dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // ✅ 1. List + filter doctors
  @Get()
  getDoctors(@Query() query: ListDoctorQueryDto) {
    return this.doctorService.getDoctors(query);
  }

  // ✅ 2. Get by doctor ID
  @Get(':id')
  getDoctorById(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.getDoctorById(id);
  }

  // ✅ 3. Get by user ID
  @Get('user/:userId')
  getDoctorByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.doctorService.getDoctorByUserId(userId);
  }

  // ✅ 4. Update doctor info
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  updateDoctor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpg|jpeg|png)$/ })
        .addMaxSizeValidator({ maxSize: 10_000_000 }) // 10MB
        .build({ fileIsRequired: false }),
    )
    file?: Express.Multer.File,
  ) {
    return this.doctorService.updateDoctor(id, dto, file);
  }

  // ✅ 5. Assign services
  @Post(':id/services')
  assignServices(
    @Param('id', ParseIntPipe) doctorId: number,
    @Body() body: { serviceIds: number[] },
  ) {
    return this.doctorService.assignServices(doctorId, body.serviceIds);
  }

  // ✅ 6. Delete doctor
  @Delete(':id')
  deleteDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.deleteDoctor(id);
  }
}
