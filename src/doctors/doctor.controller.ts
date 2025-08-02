import { Controller, Get, Param, ParseIntPipe, Patch,Body, Query, Post, Delete, UploadedFile, ParseFilePipeBuilder, UseInterceptors,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorDto } from './dto/doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // 1. Get all doctors (with pagination)
  @Get()
  getAllDoctors(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.doctorService.getAllDoctors(Number(page), Number(limit));
  }

  // 2. Get doctor by doctor ID
  @Get(':id')
  getDoctorById(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.getDoctorById(id);
  }

  // 3. Get doctor by user ID
  @Get('user/:userId')
  getDoctorByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.doctorService.getDoctorByUserId(userId);
  }

  // 4. Get doctors by specialty
  @Get('specialty/:specialtyId')
  getDoctorsBySpecialty(@Param('specialtyId', ParseIntPipe) specialtyId: number) {
    return this.doctorService.getDoctorsBySpecialty(specialtyId);
  }

  // 5. Update doctor
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar')) // 'avatar' là field name từ client
  async updateDoctor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DoctorDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpg|jpeg|png)$/ })
        .addMaxSizeValidator({ maxSize: 10_000_000 }) // 10MB
        .build({ fileIsRequired: false }) 
    )
    file?: Express.Multer.File,
  ) {
    return this.doctorService.updateDoctor(id, dto, file);
  }

  // 6. Assign services to doctor
  @Post(':id/services')
  assignServices(
    @Param('id', ParseIntPipe) doctorId: number,
    @Body() body: { serviceIds: number[] },
  ) {
    return this.doctorService.assignServices(doctorId, body.serviceIds);
  }

  // 7. Delete doctor by doctor ID
  @Delete(':id')
  deleteDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.deleteDoctor(id);
  }

  // 8. Get doctors by service ID
  @Get('service/:serviceId')
  getDoctorsByService(@Param('serviceId', ParseIntPipe) serviceId: number) {
    return this.doctorService.getDoctorsByService(serviceId);
  }

  // 9. Search doctors by keyword (with pagination)
  @Get('search/keyword')
  searchDoctors(
    @Query('keyword') keyword: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.doctorService.searchDoctors(keyword, Number(page), Number(limit));
  }
}
