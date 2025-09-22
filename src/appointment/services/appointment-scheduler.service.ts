import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentScheduler {
  private readonly logger = new Logger(AppointmentScheduler.name);

  constructor(private readonly dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // chạy mỗi 10 phút
  async cancelPendingAppointments() {
    const now = new Date();
    this.logger.log('Running Cron: cancelPendingAppointments');

    await this.dataSource.transaction(async (manager) => {
      // 1. Lấy các pending appointment đã quá thời gian
      const expiredAppointments = await manager.find(Appointment, {
        where: {
          status: AppointmentStatus.PENDING,
          slot: { endTime: LessThan(now) },
        },
        relations: ['slot', 'slot.schedule', 'slot.schedule.doctor'],
        lock: { mode: 'pessimistic_write' },
      });

      if (expiredAppointments.length === 0) {
        this.logger.log('No expired pending appointments found.');
        return;
      }

      for (const appt of expiredAppointments) {
        // 2. Cập nhật trạng thái thành CANCELLED
        appt.status = AppointmentStatus.CANCELLED;
        await manager.save(Appointment, appt);
        this.logger.log(`Cancelled appointment ID ${appt.id}`);

        // 3. Giải phóng slot
        if (appt.slot) {
          appt.slot.isBooked= false;
          await manager.save(AppointmentSlot, appt.slot);
          this.logger.log(`Freed slot ID ${appt.slot.id}`);
        }
      }
    });
  }
}
