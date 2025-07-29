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

@Module({
  imports: [TypeOrmModule.forFeature([User,Doctor,Specialty,DoctorServices,Patient,Service])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
