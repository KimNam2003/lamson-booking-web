import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientService } from "./patient.service";
import { PatientController } from "./patient.controller";
import { Patient } from "./entities/patient.entity";
import { User } from "src/users/entities/user.entity";

@Module({
  controllers: [PatientController],
  providers: [PatientService],
  imports: [TypeOrmModule.forFeature([Patient, User])],
})
export class PatientModule {}
