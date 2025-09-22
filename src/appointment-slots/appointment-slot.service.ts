import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';

import { AppointmentSlot } from './entities/appointment-slot.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorDayOff } from 'src/doctor-of-days/entities/doctor-off-day.enttity';
import { GenerateSlotDto } from './dto/appointment-slot.dto';
import * as moment from 'moment-timezone';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { DoctorDayOffStatus } from 'src/common/enums/doctor-day-off-status.enum';

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

    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

  ) {}

   // 🔄 Tạo slot cho 1 schedule trong 1 ngày (kèm kiểm tra ngày nghỉ)

  async generateSlots(dto: GenerateSlotDto) {
    const { scheduleIds, serviceIds, date } = dto;

    if (!scheduleIds || !scheduleIds.length) {
      throw new BadRequestException('Chưa cung cấp scheduleIds');
    }

    if (!serviceIds || !serviceIds.length) {
      throw new BadRequestException('Chưa cung cấp serviceIds');
    }

    const createdSlots: AppointmentSlot[] = [];

    for (const serviceId of serviceIds) {
      const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
      if (!service) {
        throw new NotFoundException(`Không tìm thấy service với id ${serviceId}`);
      }

      for (const scheduleId of scheduleIds) {
        const schedule = await this.scheduleRepo.findOne({
          where: { id: scheduleId },
          relations: ['doctor'],
        });

        if (!schedule) {
          throw new NotFoundException(`Không tìm thấy schedule với id ${scheduleId}`);
        }

        // Check weekday
        const weekdayOfDate = new Date(date).toLocaleString('en-US', { weekday: 'long' });
        if (weekdayOfDate !== schedule.weekday) {
          throw new BadRequestException(
            `Ngày chọn (${date}) không khớp với lịch của bác sĩ (${schedule.weekday})`,
          );
        }

        const doctor = schedule.doctor;

        // Kiểm tra ngày nghỉ đã được duyệt
       const doctorDayOff = await this.dayOffRepo.findOne({
          where: { 
            doctor: { id: doctor.id }, 
            date, 
            status: DoctorDayOffStatus.CONFIRMED, // dùng enum thay vì string
          },
        });

        if (doctorDayOff) {
          throw new BadRequestException('Bác sĩ đã nghỉ vào ngày này');
        }

        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const [endHour, endMin] = schedule.endTime.split(':').map(Number);

        const start = new Date(date);
        start.setHours(startHour, startMin, 0, 0);

        const end = new Date(date);
        end.setHours(endHour, endMin, 0, 0);

        let slotStart = new Date(start);

        while (slotStart < end) {
          const slotEnd = new Date(slotStart.getTime() + service.duration_minutes * 60 * 1000);
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
            throw new BadRequestException('Lịch khám đã tồn tại');
          }

          const slot = this.slotRepo.create({
            schedule,
            service,
            startTime: slotStart,
            endTime: slotEnd,
            isBooked: false,
            isActive: true,
          });

          await this.slotRepo.save(slot);
          createdSlots.push(slot);

          slotStart = new Date(slotStart.getTime() + service.duration_minutes * 60 * 1000);
        }
      }
    }

    // Chuyển kết quả sang giờ VN trước khi trả API
    return createdSlots.map((slot) => ({
      ...slot,
      startTime: moment(slot.startTime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment(slot.endTime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
    }));
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

  async findSlotsByDate(scheduleId: number, serviceId: number, date: string) {
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const weekdayOfDate = moment.tz(date, 'Asia/Bangkok').format('dddd');
    if (weekdayOfDate !== schedule.weekday) return [];

    const startOfDay = moment.tz(date, 'Asia/Bangkok').startOf('day').toDate();
    const endOfDay = moment.tz(date, 'Asia/Bangkok').endOf('day').toDate();

    // Lấy tất cả slot trong ngày
    const slots = await this.slotRepo
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.schedule', 'schedule')
      .leftJoinAndSelect('slot.service', 'service')
      .where('schedule.id = :scheduleId', { scheduleId })
      .andWhere('service.id = :serviceId', { serviceId })
      .andWhere('slot.startTime BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
      .orderBy('slot.startTime', 'ASC')
      .getMany();

    // Lấy tất cả appointment PENDING/CONFIRMED của doctor
      const overlappingAppointments = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.slot', 'slot') // <- quan trọng
      .leftJoin('slot.schedule', 'schedule')
      .where('schedule.id = :scheduleId', { scheduleId })
      .andWhere('appointment.status IN (:...statuses)', { statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] })
      .getMany();


      const formattedSlots = slots.map(slot => {
      // Kiểm tra slot có trùng giờ với appointment nào không
        const isBooked = overlappingAppointments.some(app => 
          slot.startTime < app.slot.endTime && slot.endTime > app.slot.startTime
        );

      return {
        ...slot,
        startTime: moment(slot.startTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(slot.endTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        isBooked,
        isActive: slot.isActive,
      };
    });

    return formattedSlots;
  }
  // 🔄 Cập nhật isActive của slot
async updateIsActive(slotId: number, isActive: boolean) {
  const slot = await this.slotRepo.findOne({ where: { id: slotId } });
  if (!slot) throw new NotFoundException('Slot not found');

  slot.isActive = isActive;
  await this.slotRepo.save(slot);

  // Trả về slot đã cập nhật kèm format thời gian VN
  return {
    ...slot,
    startTime: moment(slot.startTime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment(slot.endTime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
  };
}


  // ❌ Xóa slot theo ID
  async delete(id: number) {
    const slot = await this.slotRepo.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');
    await this.slotRepo.remove(slot);
    return { message: 'Deleted successfully' };
  }
}
