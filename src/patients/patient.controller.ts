import {
  Controller,
  Get,
  Param,
  Query,
  Put,
  Delete,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientDto } from './dto/patient.dto';
import { Gender } from 'src/common/enums/gender.enum';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // 1. Get patient by ID
  @Get(':id')
  getPatientById(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.getPatientById(id);
  }

  // 2. Get all patients with pagination
    @Get()
  async getAllPatients(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('userId') userId?: string,
    @Query('fullName') fullName?: string,
    @Query('gender') gender?: Gender,
  ) {
    return this.patientService.getAllPatients(
      page,
      limit,
      userId ? parseInt(userId, 10) : undefined,
      fullName,
      gender,
    );
  }


  // 3. Update patient
  @Put(':id')
  updatePatient(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PatientDto,
  ) {
    return this.patientService.updatePatient(id, dto);
  }

  // 4. Delete patient
  @Delete(':id')
  deletePatient(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.deletePatient(id);
  }

  @Get('by-user/:userId')
  async getPatientByUserId(@Param('userId') userId: string) {
    return this.patientService.getPatientByUserId(parseInt(userId, 10));
  }

}
