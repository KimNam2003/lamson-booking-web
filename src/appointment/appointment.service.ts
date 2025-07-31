import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(AppointmentSlot)
    private readonly slotRepo: Repository<AppointmentSlot>,

    private dataSource: DataSource,

  ) {}

  // 🔹 Create a new appointment
   // 🔹 Đặt lịch hẹn
  async createAppointment(dto: CreateAppointmentDto) {
    const { slotId, patientId, note } = dto;

    return await this.dataSource.transaction(async (manager) => {
      // 🔒 Lock slot để tránh race condition
      const slot = await manager.findOne(AppointmentSlot, {
        where: { id: slotId },
        relations: ['schedule.doctor', 'service'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!slot) {
        throw new NotFoundException('Slot not found');
      }

      if (slot.isBooked) {
        throw new BadRequestException('Slot already booked');
      }

      if (!slot.service || isNaN(slot.service.price)) {
        throw new BadRequestException('Slot does not have a valid service with price');
      }

      const patient = await manager.findOne(Patient, {
        where: { id: patientId },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const appointment = manager.create(Appointment, {
        slot,
        patient,
        note: note || null,
        status: AppointmentStatus.PENDING,
        price: slot.service.price,
      });

      slot.isBooked = true;
      await manager.save(AppointmentSlot, slot);
      return await manager.save(Appointment, appointment);
    });
  }

  // 🔹 Get all appointments (optionally by patient or doctor)
  async findAll(patientId?: number, doctorId?: number) {
    const where: any = {};
    if (patientId) where.patient = { id: patientId };
    if (doctorId) where.slot = { doctor: { id: doctorId } };

    return this.appointmentRepo.find({
      where,
      relations: ['slot', 'patient', 'slot.schedule.service', 'slot.schedule.doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: AppointmentStatus) {
    // 🔍 Tìm appointment kèm slot
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['slot'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // 🔍 Kiểm tra status có hợp lệ không
    const validStatuses = Object.values(AppointmentStatus);
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid appointment status');
    }

    // ✅ Gán status mới
    appointment.status = status;

    // 🔄 Nếu bị huỷ/reject → bỏ đánh dấu đã đặt
    if (status === AppointmentStatus.CANCELLED || status === AppointmentStatus.REJECTED) {
      appointment.slot.isBooked = false;
      await this.slotRepo.save(appointment.slot);
    }

    // ✅ Lưu thay đổi
    return this.appointmentRepo.save(appointment);
  }

}
