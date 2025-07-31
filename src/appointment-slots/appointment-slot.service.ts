import {Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppointmentSlot } from './entities/appointment-slot.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorDayOff } from 'src/doctor-of-days/entities/doctor-off-day.enttity';
import { GenerateSlotDto } from './dto/appointment-slot.dto';

@Injectable()
export class AppointmentSlotService {
  constructor(
    @InjectRepository(AppointmentSlot)
    private readonly slotRepo: Repository<AppointmentSlot>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(DoctorDayOff)
    private readonly dayOffRepo: Repository<DoctorDayOff>,
  ) {}

  // 🔄 Tạo slot cho 1 schedule trong 1 ngày (kèm kiểm tra ngày nghỉ)
  async generateSlots(dto: GenerateSlotDto) {
    const { scheduleId, serviceId, date } = dto;

    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['doctor'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const doctor = schedule.doctor;

    // ✅ Kiểm tra bác sĩ có nghỉ ngày này không
    const doctorDayOff = await this.dayOffRepo.findOne({
      where: {
        doctor: { id: doctor.id },
        date: date,
      },
    });

    if (doctorDayOff) {
      throw new BadRequestException('Doctor is on leave for this date');
    }

    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const start = new Date(date);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);

    const createdSlots: AppointmentSlot[] = [];
    let slotStart = new Date(start);

    while (slotStart < end) {
      const slotEnd = new Date(
        slotStart.getTime() + service.duration_minutes * 60 * 1000,
      );

      if (slotEnd > end) break;

      const exists = await this.slotRepo.findOne({
        where: {
          schedule: { id: scheduleId },
          service: { id: serviceId },
          startTime: slotStart,
          endTime: slotEnd,
        },
      });

      if (exists) {
        throw new BadRequestException(
          `Slot from ${slotStart.toISOString()} to ${slotEnd.toISOString()} already exists`,
        );
      }

      const slot = this.slotRepo.create({
        schedule,
        service,
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
        isBooked: false,
      });

      await this.slotRepo.save(slot);
      createdSlots.push(slot);

      slotStart = new Date(
        slotStart.getTime() + service.duration_minutes * 60 * 1000,
      );
    }

    return createdSlots;
  }

  // 📄 Lấy tất cả slot (lọc theo doctor nếu có)
  async findAll(doctorId?: number) {
    const slots = await this.slotRepo.find({
      relations: ['schedule', 'schedule.doctor', 'service'],
      order: { startTime: 'ASC' },
    });

    if (doctorId) {
      return slots.filter((slot) => slot.schedule?.doctor?.id === doctorId);
    }

    return slots;
  }

  // ❌ Xóa slot theo ID
  async delete(id: number) {
    const slot = await this.slotRepo.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');
    await this.slotRepo.remove(slot);
    return { message: 'Deleted successfully' };
  }
}
