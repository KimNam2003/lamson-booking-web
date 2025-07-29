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
  getAllPatients(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.patientService.getAllPatients(+page, +limit);
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
}
