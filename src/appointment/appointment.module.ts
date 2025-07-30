import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

import { Appointment } from './entities/appointment.entity';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Service } from 'src/services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AppointmentSlot, Patient, Service]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
