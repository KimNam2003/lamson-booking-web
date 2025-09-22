import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager, In } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import {JwtPayload } from 'src/auth/types/types';
import * as moment from 'moment-timezone';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    private readonly dataSource: DataSource,
  ) {}

  // Khóa các slot trùng giờ
  private async lockOverlappingSlots(
    manager: EntityManager,
    doctorId: number,
    startTime: Date,
    endTime: Date,
  ) {
    return manager
      .createQueryBuilder(AppointmentSlot, 's')
      .innerJoin('s.schedule', 'sch')
      .innerJoin('sch.doctor', 'd')
      .where('d.id = :doctorId', { doctorId })
      .andWhere('s.startTime < :endTime', { endTime })
      .andWhere('s.endTime > :startTime', { startTime })
      .setLock('pessimistic_write')
      .getMany();
  }

  // 1. Đặt lịch hẹn (Patient)
async createAppointment(dto: CreateAppointmentDto, user: JwtPayload) {

    if (user.role !== 'patient' || !user.roleId) {
      throw new UnauthorizedException('Only patient can create appointment');
    }

    return await this.dataSource.transaction(async (manager) => {
      const { slotId, note } = dto;

      // Tìm slot & khóa
      const slot = await manager.findOne(AppointmentSlot, {
        where: { id: slotId },
        relations: ['schedule.doctor', 'service'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!slot) throw new NotFoundException('Slot not found');
      if (!slot.service || isNaN(slot.service.price)) {
        throw new BadRequestException('Invalid service in slot');
      }
      if (!slot.isActive) {
      throw new BadRequestException('Slot is not active');
    }

      // Tìm bệnh nhân
      const patient = await manager.findOne(Patient, {
        where: { id: user.roleId },
      });
      if (!patient) throw new NotFoundException('Patient not found');

      // Check trùng giờ
      const overlappingSlots = await this.lockOverlappingSlots(
        manager,
        slot.schedule.doctor.id,
        slot.startTime,
        slot.endTime,
      );

      const conflictingAppointments = await manager.find(Appointment, {
        where: {
          slot: In(overlappingSlots.map((s) => s.id)),
          status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        },
      });
      if (conflictingAppointments.length > 0) {
        throw new BadRequestException('Doctor already booked during this time');
      }

      // Tạo appointment
      const appointment = manager.create(Appointment, {
        slot,
        patient,
        note: note || null,
        status: AppointmentStatus.PENDING,
        price: slot.service.price,
      });

      return await manager.save(Appointment, appointment);
    });
  }

  // 2. Lấy danh sách appointment theo role + lọc status
  async findAll(user: JwtPayload, status?: AppointmentStatus, patientId?: Number) {
    const where: any = {};

    if (user.role === 'patient') {
      where.patient = { id: user.roleId };
    } else if (user.role === 'doctor') {
      where.slot = { schedule: { doctor: { id: user.roleId } } };
    } else if ((user.role === 'admin' || user.role === 'super_admin') && patientId) {
      where.patient = { id: patientId };
    }

    if (status) {
      where.status = status;
    }

    return this.appointmentRepo.find({
      where,
      relations: [
        'slot',
        'slot.service',
        'slot.schedule',
        'slot.schedule.doctor',
        'slot.schedule.doctor.specialty',
        'patient',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Lấy chi tiết 1 appointment
  async findOne(id: number) {
    const appt = await this.appointmentRepo.findOne({
      where: { id },
      relations: [
        'slot',
        'slot.service',
        'slot.schedule',
        'slot.schedule.doctor',
        'slot.schedule.doctor.specialty',
        'slot.schedule.doctor.schedules',
        'patient',
        'medicalHistory'
      ],
    });

    if (!appt) throw new NotFoundException('Appointment not found');

    // Convert giờ sang VN
    const slot = appt.slot;
    const slotVN = {
      ...slot,
      startTime: moment(slot.startTime)
        .tz('Asia/Ho_Chi_Minh')
        .format('YYYY-MM-DD HH:mm'),
      endTime: moment(slot.endTime)
        .tz('Asia/Ho_Chi_Minh')
        .format('YYYY-MM-DD HH:mm'),
    };

    return { ...appt, slot: slotVN };
  }

  // 4. Cập nhật trạng thái (Doctor)
  async updateStatus(id: number, status: AppointmentStatus, user: JwtPayload) {
    return this.dataSource.transaction(async (manager) => {
      const appointment = await manager.findOne(Appointment, {
        where: { id },
        relations: ['slot', 'slot.schedule', 'slot.schedule.doctor', 'patient'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!appointment) throw new NotFoundException('Appointment not found');

      if (user.role === 'doctor' && user.roleId) {
        // Bác sĩ: chỉ update appointment của mình
        if (appointment.slot.schedule.doctor.id !== user.roleId) {
          throw new UnauthorizedException('You cannot update this appointment');
        }
        // Bác sĩ chỉ được đánh dấu completed
        if (status !== AppointmentStatus.COMPLETED) {
          throw new BadRequestException('Doctors can only mark appointments as completed');
        }
      } else if (user.role === 'patient' && user.roleId) {
        // Bệnh nhân: chỉ hủy appointment của chính mình
        if (appointment.patient.id !== user.roleId) {
          throw new UnauthorizedException('You cannot cancel this appointment');
        }
        if (status !== AppointmentStatus.CANCELLED) {
          throw new BadRequestException(
            'Patients can only cancel their appointments',
          );
        }
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        // Admin/Super_admin có quyền làm tất cả
        if (![AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED].includes(status)) {
          throw new BadRequestException('Invalid status for admin');
        }
      } else {
        throw new UnauthorizedException('You are not allowed to update this appointment');
      }

      // Kiểm tra trạng thái hợp lệ chung
      const validStatuses = Object.values(AppointmentStatus);
      if (!validStatuses.includes(status)) {
        throw new BadRequestException('Invalid appointment status');
      }

      // Business rule: chỉ Confirmed mới chuyển sang Completed
      if (status === AppointmentStatus.COMPLETED) {
        if (appointment.status !== AppointmentStatus.CONFIRMED) {
          throw new BadRequestException(
            'Only confirmed appointments can be completed',
          );
        }
      }

      appointment.status = status;

      // Nếu hủy / từ chối => giải phóng slot
      if (
        status === AppointmentStatus.CANCELLED ||
        status === AppointmentStatus.REJECTED
      ) {
        const { startTime, endTime, schedule } = appointment.slot;
        const doctorId = schedule.doctor.id;

        const overlappingSlots = await this.lockOverlappingSlots(
          manager,
          doctorId,
          startTime,
          endTime,
        );

        for (const s of overlappingSlots) s.isBooked = false;
        await manager.save(AppointmentSlot, overlappingSlots);
      }

      return await manager.save(Appointment, appointment);
    });
  }

  // 5. Thay đổi lịch hẹn (Reschedule)
  async rescheduleAppointment(
    id: number,
    newSlotId: number,
    user: JwtPayload,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Lấy appointment
      const appointment = await manager.findOne(Appointment, {
        where: { id },
        relations: ['slot', 'slot.schedule', 'slot.schedule.doctor', 'patient'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn');

      // 2. Kiểm tra quyền
      if (user.role === 'patient' && appointment.patient.id !== user.roleId) {
        throw new UnauthorizedException('Bạn không có quyền thay đổi lịch hẹn này');
      } else if (
        user.role !== 'patient' &&
        user.role !== 'admin' &&
        user.role !== 'super_admin'
      ) {
        throw new UnauthorizedException('Bạn không có quyền thay đổi lịch hẹn này');
      }

      // 3. Kiểm tra trạng thái appointment
      if ([AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED,AppointmentStatus.REJECTED].includes(appointment.status)) {
        throw new BadRequestException('Không thể thay đổi lịch hẹn đã hủy hoặc đã hoàn tất');
      }

      // 4. Lấy slot mới & khóa
      const newSlot = await manager.findOne(AppointmentSlot, {
        where: { id: newSlotId },
        relations: ['schedule.doctor', 'service'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!newSlot) throw new NotFoundException('Không tìm thấy slot mới');
      if (!newSlot.isActive) throw new BadRequestException('Slot mới không khả dụng');

      // 5. Kiểm tra trùng giờ với các appointment khác
      const overlappingSlots = await this.lockOverlappingSlots(
        manager,
        newSlot.schedule.doctor.id,
        newSlot.startTime,
        newSlot.endTime,
      );
      const conflictingAppointments = await manager.find(Appointment, {
        where: {
          slot: In(overlappingSlots.map((s) => s.id)),
          status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        },
      });
      if (conflictingAppointments.length > 0) {
        throw new BadRequestException('Bác sĩ đã có lịch hẹn trong khoảng thời gian này');
      }

      // 6. Giải phóng slot cũ
      appointment.slot.isBooked = false;
      await manager.save(AppointmentSlot, appointment.slot);

      // 7. Cập nhật appointment với slot mới
      appointment.slot = newSlot;
      appointment.status = AppointmentStatus.PENDING; // đặt lại trạng thái chờ duyệt
      return await manager.save(Appointment, appointment);
    });
  }


}
