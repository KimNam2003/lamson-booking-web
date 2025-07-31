import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorDayOff } from './entities/doctor-off-day.enttity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { CreateDoctorDayOffDto } from './dto/create-doctor-off-day.dto';

@Injectable()
export class DoctorDayOffService {
  constructor(
    @InjectRepository(DoctorDayOff)
    private readonly dayOffRepo: Repository<DoctorDayOff>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async create(dto: CreateDoctorDayOffDto) {
  const doctor = await this.doctorRepo.findOne({ where: { id: dto.doctorId } });
  if (!doctor) throw new NotFoundException('Doctor not found');

  const existingDayOff = await this.dayOffRepo.findOne({
    where: {
      doctor: { id: dto.doctorId },
      date: dto.date,
    },
    relations: ['doctor'],
  });

  if (existingDayOff) {
    throw new BadRequestException('Doctor already has a day off on this date');
  }

  const dayOff = this.dayOffRepo.create({
    doctor,
    date: dto.date,
    reason: dto.reason || null,
  });

  return await this.dayOffRepo.save(dayOff);
  }


  async findByDoctor(doctorId: number) {
    return await this.dayOffRepo.find({
      where: { doctor: { id: doctorId } },
      order: { date: 'ASC' },
    });
  }

  async remove(id: number) {
    const record = await this.dayOffRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Day off not found');
    return await this.dayOffRepo.remove(record);
  }
}
