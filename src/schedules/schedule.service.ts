import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { ScheduleDto } from './dto/schedule.dto';
import { Weekday } from 'src/common/enums/weekday.enum';
@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  // Chuyển "HH:MM" -> phút
  private timeStringToMinutes(time: string): number {
    const [hourStr, minuteStr] = time.split(':');
    return Number(hourStr) * 60 + Number(minuteStr);
  }

  // Hàm check overlap
  private async checkOverlap(
    doctorId: number,
    weekday: Weekday,
    dtoStart: number,
    dtoEnd: number,
    excludeId?: number,
  ) {
    const qb = this.scheduleRepo.createQueryBuilder('schedule')
      .where('schedule.doctor = :doctorId', { doctorId })
      .andWhere('schedule.weekday = :weekday', { weekday });

    if (excludeId) {
      qb.andWhere('schedule.id != :excludeId', { excludeId });
    }

    qb.andWhere(
      ':dtoStart < TIME_TO_SEC(schedule.endTime)/60 AND :dtoEnd > TIME_TO_SEC(schedule.startTime)/60',
      { dtoStart, dtoEnd },
    );

    return qb.getOne();
  }

  // 1. Tạo schedule mới
  async create(dto: ScheduleDto) {
    const dtoStart = this.timeStringToMinutes(dto.startTime);
    const dtoEnd = this.timeStringToMinutes(dto.endTime);

    const overlapping = await this.checkOverlap(dto.doctorId, dto.weekday, dtoStart, dtoEnd);
    if (overlapping) {
      throw new BadRequestException('Schedule time overlaps with an existing schedule');
    }

    const schedule = this.scheduleRepo.create({
      ...dto,
      doctor: { id: dto.doctorId },
    });

    return this.scheduleRepo.save(schedule);
  }

  // 2. Lấy danh sách schedule (có filter + phân trang)
  async findSchedules(
    doctorId?: number,
    weekday?: number,
    page = 1,
    limit = 10,
  ) {
    page = Number(page);
    limit = Number(limit);

    const qb = this.scheduleRepo.createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.doctor', 'doctor');

    if (doctorId) qb.andWhere('doctor.id = :doctorId', { doctorId });
    if (weekday !== undefined) qb.andWhere('schedule.weekday = :weekday', { weekday });

    qb.orderBy('schedule.weekday', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 3. Lấy 1 schedule theo ID
  async findOne(id: number) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  // 4. Cập nhật schedule
  async update(id: number, dto: ScheduleDto) {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const dtoStart = this.timeStringToMinutes(dto.startTime);
    const dtoEnd = this.timeStringToMinutes(dto.endTime);

    const overlapping = await this.checkOverlap(dto.doctorId, dto.weekday, dtoStart, dtoEnd, id);
    if (overlapping) {
      throw new BadRequestException('Schedule time overlaps with an existing schedule');
    }

    Object.assign(schedule, dto, { doctor: { id: dto.doctorId } });
    return this.scheduleRepo.save(schedule);
  }

  // 5. Xóa schedule
  async remove(id: number) {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    await this.scheduleRepo.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }
}
