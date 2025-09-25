import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { PaymentsController } from "./payment.controller";
import { PaymentsService } from "./payment.service";
import { Appointment } from "src/appointment/entities/appointment.entity";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [TypeOrmModule.forFeature([Payment,Appointment])],
  exports : [PaymentsService]
})
export class PaymentModule {}