import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctor } from './entities/doctor.entity';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';

import { User } from 'src/users/entities/user.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { UploadModule } from 'src/UploadAvatar/UploadAvatar.module';

@Module({
  controllers: [DoctorController],
  providers: [DoctorService],
  imports: [
    TypeOrmModule.forFeature([User,Doctor, Specialty, Service, DoctorServices,Schedule]),
    UploadModule
  ],
  exports: [DoctorService]
})
export class DoctorModule {}

