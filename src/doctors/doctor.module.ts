import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctor } from './entities/doctor.entity';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';

import { User } from 'src/users/entities/user.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorService as DoctorServiceEntity } from 'src/doctor-services/entities/doctor-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor,User, Specialty, Service,  DoctorServiceEntity,]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
