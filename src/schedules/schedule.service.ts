import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { ScheduleDto } from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  // 1. Create new schedule
  async create(dto: ScheduleDto) {
    const existing = await this.scheduleRepo.findOne({
      where: {
        doctor: { id: dto.doctorId },
        weekday: dto.weekday,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      relations: ['doctor'],
    });

    if (existing) {
      throw new BadRequestException('This schedule already exists');
    }

    const schedule = this.scheduleRepo.create({
        ...dto,
    doctor: { id: dto.doctorId }
  },
)
    return this.scheduleRepo.save(schedule);
  }

  // 2. Get all schedules (with optional doctorId)
  async findAllScheduleByDoctorId(doctorId?: number) {
  const where = doctorId ? { doctor: { id: doctorId } } : {};
  return this.scheduleRepo.find({
    where,
    relations: ['doctor'],
    order: { weekday: 'ASC', startTime: 'ASC' },
  });
    }

  // 3. Get one schedule by ID
  async findOne(id: number) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  // 4. Update schedule
  async update(id: number, dto: ScheduleDto) {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    Object.assign(schedule, dto);
    return this.scheduleRepo.save(schedule);
  }

  // 5. Delete
  async remove(id: number) {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    await this.scheduleRepo.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }
}
