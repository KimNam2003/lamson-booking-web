import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MedicalHistory } from './entities/history.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { MedicalHistoryDto } from './dto/history.dto';
import { QueryMedicalHistoryDto } from './dto/query-medical-history.dto';



@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private historyRepo: Repository<MedicalHistory>,

    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  async create(dto: MedicalHistoryDto) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: dto.appointmentId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    
    const existing = await this.historyRepo.findOne({
    where: { appointment: { id: dto.appointmentId } },
  });

  if (existing) {
    throw new BadRequestException('Medical history for this appointment already exists');
  }
    const history = this.historyRepo.create({
      ...dto,
      appointment,
    });
    return await this.historyRepo.save(history);
  }

  async findAll(query: QueryMedicalHistoryDto) {
    const { page = 1, limit = 10, search, patientId, doctorId } = query;

    const where: any = {};
    if (search) {
        where.summary = Like(`%${search}%`);
    }
    if (patientId) {
        where.appointment = { patient: { id: patientId } };
    }
    if (doctorId) {
        where.appointment = { slot: { schedule: { doctor: { id: doctorId } } } };
    }

    const [data, total] = await this.historyRepo.findAndCount({
        where,
        relations: ['appointment', 'appointment.patient', 'appointment.slot.schedule.doctor'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
    });
    
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const history = await this.historyRepo.findOne({
      where: { id },
      relations: ['appointment', 'appointment.patient', 'appointment.slot.schedule.doctor'],
    });
    if (!history) throw new NotFoundException('Medical history not found');
    return history;
  }

  async update(id: number, dto: MedicalHistoryDto) {
    const history = await this.historyRepo.findOne({ where: { id } });
    if (!history) throw new NotFoundException('Medical history not found');

    Object.assign(history, dto);
    return await this.historyRepo.save(history);
  }

  async remove(id: number) {
    const history = await this.historyRepo.findOne({ where: { id } });
    if (!history) throw new NotFoundException('Medical history not found');

    return await this.historyRepo.remove(history);
  }
}
