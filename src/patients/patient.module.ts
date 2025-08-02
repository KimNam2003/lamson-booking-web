import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientService } from "./patient.service";
import { PatientController } from "./patient.controller";
import { Patient } from "./entities/patient.entity";
import { User } from "src/users/entities/user.entity";
import { Appointment } from "src/appointment/entities/appointment.entity";
import { UploadModule } from "src/UploadAvatar/UploadAvatar.module";

@Module({
  controllers: [PatientController],
  providers: [PatientService],
  imports: [TypeOrmModule.forFeature([Patient, User,Appointment]),UploadModule],
  exports : [PatientService]
})
export class PatientModule {}
