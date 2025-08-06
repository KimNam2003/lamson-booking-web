import {Controller, Post, Param, Body, Get, ParseIntPipe,} from '@nestjs/common';
import { DoctorServicesService } from './doctor-service.service';

@Controller('doctor-services')
export class DoctorServicesController {
  constructor(
    private readonly doctorServicesService: DoctorServicesService,
  ) {}

  // Gán danh sách dịch vụ cho bác sĩ
  @Post(':doctorId/assign')
  async assignServicesToDoctor(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() body: { serviceIds: number[] },
  ) {
    return await this.doctorServicesService.assignServicesToDoctor(
      doctorId,
      body.serviceIds,
    );
  }

  // Gán danh sách bác sĩ cho một dịch vụ
  @Post(':serviceId/assign')
  async assignDoctorsToService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() body: { doctorIds: number[] },
  ) {
    return await this.doctorServicesService.assignDoctorsToService(
      serviceId,
      body.doctorIds,
    );
  }

  // Lấy danh sách bác sĩ theo dịch vụ
  @Get(':serviceId/doctors')
  async getDoctorsByServiceId(
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ) {
    return await this.doctorServicesService.getDoctorsByServiceId(serviceId);
  }

  // Lấy danh sách serviceId theo doctor
  @Get(':doctorId/services')
  async getServicesByDoctorId(
    @Param('doctorId', ParseIntPipe) doctorId: number,
  ) {
    return await this.doctorServicesService.getServiceIdsByDoctor(doctorId);
  }
}
