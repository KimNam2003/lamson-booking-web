import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Service } from 'src/services/entities/service.entity';
import { UserController } from './users.controller';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';
import { UploadModule } from 'src/UploadAvatar/UploadAvatar.module';
import { DoctorModule } from 'src/doctors/doctor.module';
import { PatientModule } from 'src/patients/patient.module';

@Module({
  imports: [TypeOrmModule.forFeature([User,Doctor,Specialty,DoctorServices,Patient,Service]),UploadModule, DoctorModule,PatientModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
