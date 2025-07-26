import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceDto } from './dto/service.dto';
import { Specialty } from 'src/specialties/entities/specialty.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,

    @InjectRepository(Specialty)
    private specialtyRepo: Repository<Specialty>,
  ) {}

  //  Create a new service
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

  // Lấy all services
  async findAll(): Promise<Service[]> {
    return this.serviceRepo.find({ relations: ['specialty'] });
  }

  // lấy 1 service bằng ID
  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id },
      relations: ['specialty'],
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  // Update a service
  async update(id: number, serviceDto: ServiceDto): Promise<Service> {
    const service = await this.serviceRepo.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const duplicate = await this.serviceRepo.findOneBy({ name: serviceDto.name });
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(`Service name "${serviceDto.name}" is already in use`);
    }

    Object.assign(service, {
      ...serviceDto,
      specialty: serviceDto.specialty_id
        ? { id: serviceDto.specialty_id } as any
        : null,
    });

    try {
      return await this.serviceRepo.save(service);
    } catch (error) {
      throw new BadRequestException(`Failed to update service: ${error.message}`);
    }
  }

  // xóa service
  async remove(id: number): Promise<{ message: string }> {
    const service = await this.serviceRepo.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    await this.serviceRepo.delete(id);
    return { message: `Successfully deleted service with ID ${id}` };
  }
}
