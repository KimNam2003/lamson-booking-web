import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Service } from 'src/services/entities/service.entity';
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

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  // 🔹 Create a new appointment
  async createAppointment(dto: CreateAppointmentDto) {
    const { slotId, patientId, note } = dto;

    // 🔍 Lấy slot kèm doctor và service
    const slot = await this.slotRepo.findOne({
      where: { id: slotId },
      relations: ['doctor', 'service'],
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.isBooked) {
      throw new BadRequestException('Slot already booked');
    }

    if (!slot.service) {
      throw new BadRequestException('Slot does not have a linked service');
    }

    const patient = await this.patientRepo.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const appointment = this.appointmentRepo.create({
      slot,
      patient,
      note: note || null,
      status: AppointmentStatus.PENDING,
      price: slot.service.price, // 💰 Lưu giá tại thời điểm đặt
    });

    // ✅ Đánh dấu slot đã được đặt
    slot.isBooked = true;
    await this.slotRepo.save(slot);

    // ✅ Lưu lịch hẹn
    return await this.appointmentRepo.save(appointment);
  }

  // 🔹 Get all appointments (optionally by patient or doctor)
  async findAll(patientId?: number, doctorId?: number) {
    const where: any = {};
    if (patientId) where.patient = { id: patientId };
    if (doctorId) where.slot = { doctor: { id: doctorId } };

    return this.appointmentRepo.find({
      where,
      relations: ['slot', 'patient', 'service', 'slot.doctor'],
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
