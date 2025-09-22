import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentSlot } from './entities/appointment-slot.entity';
import { AppointmentSlotService } from './appointment-slot.service';
import { AppointmentSlotController } from './appointment-slot.controller';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorDayOff } from 'src/doctor-of-days/entities/doctor-off-day.enttity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentSlot, Schedule, Service,DoctorDayOff,Appointment])],
  providers: [AppointmentSlotService],
  controllers: [AppointmentSlotController],
})
export class AppointmentSlotModule {}
