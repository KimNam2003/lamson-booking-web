import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorDayOff } from './entities/doctor-off-day.enttity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorDayOffController } from './doctor-day-off.controller';
import { DoctorDayOffService } from './doctor-day-off.service';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorDayOff, Doctor])],
  controllers: [DoctorDayOffController],
  providers: [DoctorDayOffService],
})
export class DoctorDayOffModule {}
