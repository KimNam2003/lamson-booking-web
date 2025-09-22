import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistoryService } from './history.service';
import { MedicalHistory } from './entities/history.entity';
import { MedicalHistoryController } from './history.controller';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalHistory,Appointment])],
  providers: [MedicalHistoryService],
  controllers: [MedicalHistoryController],
  exports: [TypeOrmModule, MedicalHistoryService],
})
export class MedicalHistoryModule {}
