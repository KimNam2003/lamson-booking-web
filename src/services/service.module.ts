import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Specialty } from '../specialties/entities/specialty.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Specialty,Doctor,DoctorServices],)],
  controllers: [ServiceController],
  providers: [ServiceService]
  
})
export class ServiceModule {}
