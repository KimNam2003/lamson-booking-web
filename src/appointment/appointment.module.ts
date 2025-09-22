import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentService } from './services/appointment.service';
import { AppointmentController } from './appointment.controller';

import { Appointment } from './entities/appointment.entity';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Service } from 'src/services/entities/service.entity';
import { MedicalHistory } from 'src/history/entities/history.entity';
import { AppointmentScheduler } from './services/appointment-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AppointmentSlot, Patient, Service,MedicalHistory]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService,AppointmentScheduler],
  exports: [AppointmentService],
})
export class AppointmentModule {}
