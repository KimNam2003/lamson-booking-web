import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AppointmentSlot } from './entities/appointment-slot.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Service } from 'src/services/entities/service.entity';

@Injectable()
export class AppointmentSlotService {
  constructor(
    @InjectRepository(AppointmentSlot)
    private readonly slotRepo: Repository<AppointmentSlot>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  // 🔄 Auto-generate slots for doctor on specific date with service
 async generateSlots(doctorId: number, serviceId: number, date: string) {
  const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
  if (!doctor) throw new NotFoundException('Doctor not found');

  const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
  if (!service) throw new NotFoundException('Service not found');

  const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }); // ✅ Chỉ lấy tên thứ

  const schedules = await this.scheduleRepo.find({
    where: { doctor: { id: doctorId }, weekday },
  });

  if (!schedules.length) throw new NotFoundException('No schedule for this weekday');

  const createdSlots: AppointmentSlot[] = [];

  for (const schedule of schedules) {
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
          doctor: { id: doctorId },
          service: { id: serviceId }, // ✅ nếu muốn kiểm tra theo service
          startTime: slotStart,
          endTime: slotEnd,
        },
      });

      if (!exists) {
        const slot = this.slotRepo.create({
          doctor,
          service, // ✅ Gán service vào slot
          startTime: new Date(slotStart),
          endTime: new Date(slotEnd),
          isBooked: false,
        });
        await this.slotRepo.save(slot);
        createdSlots.push(slot);
      }

      slotStart = new Date(slotStart.getTime() + service.duration_minutes * 60 * 1000);
    }
  }

  return createdSlots;
}


  // 📄 Get all slots (optionally by doctor)
  async findAll(doctorId?: number) {
    const where = doctorId ? { doctor: { id: doctorId } } : {};
    return this.slotRepo.find({
      where,
      relations: ['doctor'],
      order: { startTime: 'ASC' },
    });
  }

  // ❌ Delete a slot
  async delete(id: number) {
    const slot = await this.slotRepo.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');
    await this.slotRepo.remove(slot);
    return { message: 'Deleted successfully' };
  }
}
