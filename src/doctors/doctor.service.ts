import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { In, Repository } from 'typeorm';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';
import { DoctorDto } from './dto/doctor.dto';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(DoctorServices)
    private readonly doctorServiceRepo: Repository<DoctorServices>,

    @InjectRepository(User)
    private readonly userServiceRepo: Repository<User>,

  ) {}

  // 1. Get by doctorId
  async getDoctorById(id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['specialty', 'doctorServices.service'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  // 2. Get by userId
  async getDoctorByUserId(userId: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['specialty', 'user', 'doctorServices', 'doctorServices.service'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  // 3. Get all doctors
 async getAllDoctors(page = 1, limit = 10) {
  const [doctors, total] = await this.doctorRepo.findAndCount({
    relations: ['user', 'specialty'],
    order: { id: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
  return {
    data: doctors,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}


  // 4. Get doctors by specialty
  async getDoctorsBySpecialty(specialtyId: number) {
    const doctors = await this.doctorRepo.find({
      where: { specialty: { id: specialtyId } },
      relations: ['specialty', 'user'],
    });
    return doctors;
  }

  // 5. Update doctor
  async updateDoctor(id: number, dto: DoctorDto) {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (dto.specialtyId) {
      const specialty = await this.specialtyRepo.findOne({
        where: { id: dto.specialtyId },
      });
      if (!specialty) throw new NotFoundException('Specialty not found');
      doctor.specialty = specialty;
    }

    Object.assign(doctor, dto);
    return this.doctorRepo.save(doctor);
  }

  // 6. Assign services to doctor
  async assignServices(doctorId: number, serviceIds: number[]) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const services = await this.serviceRepo.find({
      where: { id: In(serviceIds) },
    });

    if (services.length !== serviceIds.length) {
      throw new NotFoundException('Some service IDs are invalid');
    }
    await this.doctorServiceRepo.delete({ doctor: { id: doctorId } });

    const newAssignments = serviceIds.map((serviceId) =>
      this.doctorServiceRepo.create({
        doctor: { id: doctorId },
        service: { id: serviceId },
      })
    );

    await this.doctorServiceRepo.save(newAssignments);

    return {
      message: 'Services re-assigned successfully',
      assignedServiceIds: serviceIds,
    };
  }

  //Delete doctor by id 
  async deleteDoctor(id: number) {
  const doctor = await this.doctorRepo.findOne({
    where: { id },
    relations: ['user'],
  });

  if (!doctor) throw new NotFoundException('Doctor not found');

  // Xóa user -> tự động cascade xóa luôn doctor
  await this.userServiceRepo.remove(doctor.user);

  return { message: 'Doctor and related user deleted successfully' };
}

async getDoctorsByService(serviceId: number) {
  const links = await this.doctorServiceRepo.find({
    where: { service: { id: serviceId } },
    relations: ['doctor', 'doctor.specialty'],
  });

  const doctors = links.map((link) => link.doctor);

  return doctors;
}
  async searchDoctors(keyword: string, page = 1, limit = 10) {
  const query = this.doctorRepo
    .createQueryBuilder('doctor')
    .leftJoinAndSelect('doctor.specialty', 'specialty')
    .where('doctor.fullName LIKE :kw OR doctor.description LIKE :kw', {
      kw: `%${keyword}%`,
    })
    .orderBy('doctor.id', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  const [doctors, total] = await query.getManyAndCount();

  return {
    data: doctors,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

}