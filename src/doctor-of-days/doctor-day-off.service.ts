import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorDayOff } from './entities/doctor-off-day.enttity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { CreateDoctorDayOffDto } from './dto/create-doctor-off-day.dto';
import { DoctorDayOffStatus } from 'src/common/enums/doctor-day-off-status.enum';
import { QueryDoctorDayOffDto } from './dto/query-doctor-day-off.dto';

@Injectable()
export class DoctorDayOffService {
  constructor(
    @InjectRepository(DoctorDayOff)
    private readonly dayOffRepo: Repository<DoctorDayOff>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  // Tạo ngày nghỉ mới
  async create(dto: CreateDoctorDayOffDto) {
    const doctor = await this.doctorRepo.findOne({ where: { id: dto.doctorId } });
    if (!doctor) throw new NotFoundException('Không tìm thấy bác sĩ');

    const existingDayOff = await this.dayOffRepo.findOne({
      where: { doctor: { id: dto.doctorId }, date: dto.date },
      relations: ['doctor'],
    });

    if (existingDayOff) {
      throw new BadRequestException('Bác sĩ đã có ngày nghỉ vào ngày này');
    }

    const dayOff = this.dayOffRepo.create({
      doctor,
      date: dto.date,
      reason: dto.reason || null,
      status: DoctorDayOffStatus.PENDING,
    });

    return await this.dayOffRepo.save(dayOff);
  }

  // Lấy tất cả ngày nghỉ của 1 bác sĩ
  async findByDoctor(doctorId: number) {
    return await this.dayOffRepo.find({
      where: { doctor: { id: doctorId } },
      order: { date: 'DESC' },
      relations: ['doctor'],
    });
  }

  // Xóa ngày nghỉ
  async remove(id: number) {
    const record = await this.dayOffRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Không tìm thấy ngày nghỉ');
    return await this.dayOffRepo.remove(record);
  }

  // Lấy tất cả ngày nghỉ (Admin) với filter: doctorId, status, date
  async findAll(filter?: QueryDoctorDayOffDto) {
    const query = this.dayOffRepo.createQueryBuilder('dayOff')
      .leftJoinAndSelect('dayOff.doctor', 'doctor')
      .orderBy('dayOff.date', 'DESC');

    if (filter?.doctorId) {
      query.andWhere('doctor.id = :doctorId', { doctorId: filter.doctorId });
    }

    if (filter?.status) {
      query.andWhere('dayOff.status = :status', { status: filter.status });
    }

    if (filter?.date) {
      query.andWhere('dayOff.date = :date', { date: filter.date });
    }

    return await query.getMany();
  }

  async updateStatus(id: number, status: DoctorDayOffStatus) {
    const record = await this.dayOffRepo.findOne({ where: { id }, relations: ["doctor"] });
    if (!record) throw new NotFoundException("Không tìm thấy ngày nghỉ");

    if (![DoctorDayOffStatus.CONFIRMED, DoctorDayOffStatus.REJECTED].includes(status)) {
      throw new BadRequestException("Trạng thái không hợp lệ");
    }

    record.status = status;
    return await this.dayOffRepo.save(record);
  }
}
