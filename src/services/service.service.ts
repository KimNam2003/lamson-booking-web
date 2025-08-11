import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceDto } from './dto/service.dto';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';
import { ServiceQueryDto } from './dto/service-query.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,

    @InjectRepository(Specialty)
    private specialtyRepo: Repository<Specialty>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(DoctorServices)
    private readonly doctorServiceRepo: Repository<DoctorServices>,
  ) {}

  // Create a new service
  async create(serviceDto: ServiceDto): Promise<Service> {
    const existed = await this.serviceRepo.findOneBy({ name: serviceDto.name });
    if (existed) {
      throw new ConflictException('This service already exists');
    }

    const specialty = await this.specialtyRepo.findOneBy({
      id: serviceDto.specialty_id,
    });
    if (!specialty) {
      throw new NotFoundException(
        `Specialty ID ${serviceDto.specialty_id} does not exist`,
      );
    }

    const service = this.serviceRepo.create({
      ...serviceDto,
      specialty,
    });

    try {
      return await this.serviceRepo.save(service);
    } catch (err) {
      throw new BadRequestException('Failed to save service: ' + err.message);
    }
  }

  // Find services with flexible query
  async findServices(query: ServiceQueryDto): Promise<Service[]> {
    const { serviceId, specialtyId, doctorId, name } = query;

    const qb = this.serviceRepo.createQueryBuilder('service')
      .leftJoinAndSelect('service.specialty', 'specialty')
      .leftJoinAndSelect('service.doctorServices', 'doctorServices')
      .leftJoinAndSelect('doctorServices.doctor', 'doctor');

    if (serviceId) {
      qb.andWhere('service.id = :serviceId', { serviceId });
    }
    if (specialtyId) {
      qb.andWhere('specialty.id = :specialtyId', { specialtyId });
    }
    if (doctorId) {
      qb.andWhere('doctor.id = :doctorId', { doctorId });
    }
    if (name) {
      qb.andWhere('service.name LIKE :name', { name: `%${name}%` });
    }

    const results = await qb.getMany();

    if ((serviceId || specialtyId || doctorId) && results.length === 0) {
      throw new NotFoundException(`No services found for given query`);
    }

    return results;
  }

  // Update services
  async update(id: number, serviceDto: ServiceDto): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id },
      relations: ['specialty'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const name = serviceDto.name?.trim();
    if (name) {
      const duplicate = await this.serviceRepo.findOneBy({ name });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(`Service name "${name}" is already in use`);
      }
      serviceDto.name = name;
    }

    const { specialty_id, ...restDto } = serviceDto;
    Object.assign(service, restDto);
    if ('specialty_id' in serviceDto) {
      if (specialty_id === null) {
        throw new BadRequestException(`Field "specialty_id" cannot be null`);
      }

      const specialty = await this.specialtyRepo.findOneBy({ id: specialty_id });
      if (!specialty) {
        throw new NotFoundException(`Specialty with ID ${specialty_id} not found`);
      }

      service.specialty = specialty;
    }
    try {
      return await this.serviceRepo.save(service);
    } catch (error) {
      console.error('Error while updating service:', error);
      throw new BadRequestException(`Failed to update service: ${error?.message}`);
    }
  }

  // Delete service
  async remove(id: number): Promise<{ message: string }> {
    const service = await this.serviceRepo.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    await this.serviceRepo.delete(id);
    return { message: `Successfully deleted service with ID ${id}` };
  }

  // Assign multiple doctors to one service
  async assignDoctorsToService(serviceId: number, doctorIds: number[]) {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: ['specialty'], // lấy chuyên khoa của service
    });
    if (!service) throw new NotFoundException('Service not found');

    const doctors = await this.doctorRepo.find({
      where: { id: In(doctorIds) },
      relations: ['specialty'], // lấy chuyên khoa của doctor
    });

    if (doctors.length !== doctorIds.length) {
      throw new NotFoundException('Some doctor IDs are invalid');
    }

    const invalidDoctors = doctors.filter(
      (doctor) => doctor.specialty.id !== service.specialty.id,
    );
    if (invalidDoctors.length > 0) {
      throw new BadRequestException(
        `Doctors with IDs ${invalidDoctors.map(d => d.id).join(', ')} do not match the service's specialty`,
      );
    }

    // Xóa gán cũ
    await this.doctorServiceRepo.delete({ service: { id: serviceId } });

    // Tạo gán mới
    const newAssignments = doctorIds.map((doctorId) =>
      this.doctorServiceRepo.create({
        doctor: { id: doctorId },
        service: { id: serviceId },
      }),
    );

    await this.doctorServiceRepo.save(newAssignments);

    return {
      message: 'Doctors assigned to service successfully',
      assignedDoctorIds: doctorIds,
    };
  }
}
