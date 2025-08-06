import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorServices } from './entities/doctor-service.entity';
import { DoctorServicesService } from './doctor-service.service';
import { DoctorServicesController } from './doctor-service.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorServices, Doctor, Service]),
  ],
  providers: [DoctorServicesService],
  controllers: [DoctorServicesController],
  exports: [DoctorServicesService],
})
export class DoctorServicesModule {}
