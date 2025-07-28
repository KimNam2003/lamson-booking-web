import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Doctor } from './entities/doctor.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorService as DoctorServiceEntity } from 'src/doctor-services/entities/doctor-service.entity';
import { DoctorDto } from './dto/doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(DoctorServiceEntity)
    private readonly doctorServiceRepository: Repository<DoctorServiceEntity>,
  ) {}

  async findAll(): Promise<Doctor[]> {
    return this.doctorRepository.find({
      relations: ['user', 'specialty', 'doctorServices', 'doctorServices.service'],
    });
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user', 'specialty', 'doctorServices', 'doctorServices.service'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async create(dto: DoctorDto): Promise<Doctor> {
    const specialty = await this.specialtyRepository.findOne({
      where: { id: dto.specialtyId },
    });
    if (!specialty) throw new NotFoundException('Specialty not found');

    const { specialtyId, serviceIds = [], ...doctorData } = dto;

    const doctor = this.doctorRepository.create({
      ...doctorData,
      specialty,
    });

    const savedDoctor = await this.doctorRepository.save(doctor);

    if (serviceIds.length > 0) {
      const services = await this.serviceRepository.findBy({
        id: In(serviceIds),
      });

      const doctorServices = services.map(service =>
        this.doctorServiceRepository.create({
          doctor: savedDoctor,
          service,
        }),
      );

      await this.doctorServiceRepository.save(doctorServices);
    }

    return savedDoctor;
  }

  async update(id: number, dto: DoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);

    Object.assign(doctor, dto);

    return this.doctorRepository.save(doctor);
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorRepository.remove(doctor);
  }
}
