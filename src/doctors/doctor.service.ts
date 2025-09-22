import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';
import { DoctorDto } from './dto/doctor.dto';
import { User } from 'src/users/entities/user.entity';
import { UploadAvatarService } from 'src/UploadAvatar/UploadAvatar.service';
import { ListDoctorQueryDto } from './dto/doctor-query-dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Specialty) private readonly specialtyRepo: Repository<Specialty>,
    @InjectRepository(Service) private readonly serviceRepo: Repository<Service>,
    @InjectRepository(DoctorServices) private readonly doctorServiceRepo: Repository<DoctorServices>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly uploadAvatarService: UploadAvatarService,
  ) {}

  // ✅ Create doctor profile
  async createDoctorProfile(user: User, dto: DoctorDto, manager: EntityManager): Promise<Doctor> {
    const specialty = await manager.findOne(Specialty, {
      where: { id: dto.specialtyId },
    });

    if (!specialty) throw new NotFoundException('Specialty not found');

    const doctor = manager.create(Doctor, {
      user,
      fullName: dto.fullName,
      phone: dto.phone,
      description: dto.description,
      experienceYears: dto.experienceYears,
      avatarUrl: dto.avatarUrl,
      specialty,
    });

    return await manager.save(Doctor, doctor);
  }

  async getDoctors(filter: ListDoctorQueryDto) {
    const { page, limit, specialtyId, serviceId, keyword, experienceYears } = filter;

    const qb = this.doctorRepo
      .createQueryBuilder('doctor')
      .leftJoin('doctor.specialty', 'specialty')
      .addSelect(['specialty.id', 'specialty.name'])
      .leftJoin('doctor.doctorServices', 'doctorServices')
      .leftJoin('doctorServices.service', 'service')

    if (specialtyId) qb.andWhere('specialty.id = :specialtyId', { specialtyId });
    if (serviceId) qb.andWhere('service.id = :serviceId', { serviceId });
    if (experienceYears !== undefined) {
      qb.andWhere('doctor.experience_years >= :experienceYears', { experienceYears });
    }
    if (keyword) {
      qb.andWhere('(doctor.full_name LIKE :kw)', { kw: `%${keyword}%` });
    }

    qb.orderBy('doctor.id', 'DESC');

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    } else {
      const data = await qb.getMany();
      return { data, total: data.length };
    }
  }


  // ✅ Get by doctor ID
  async getDoctorById(id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['specialty','schedules', 'user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  // ✅ Get by user ID
  async getDoctorByUserId(userId: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['specialty'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  // ✅ Update doctor
  async updateDoctor(id: number, dto: UpdateDoctorDto, file?: Express.Multer.File) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['specialty'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Cập nhật các field từ dto
    Object.assign(doctor, dto);

    if (dto.specialtyId) {
      const specialty = await this.specialtyRepo.findOne({ where: { id: dto.specialtyId } });
      if (!specialty) throw new NotFoundException('Specialty not found');
      doctor.specialty = specialty;
    }

    // Nếu có file thì update avatar
    if (file) {
      doctor.avatarUrl = await this.uploadAvatarService.saveDoctorAvatar(file, id);
    }

    return this.doctorRepo.save(doctor);
  }

  // ✅ Assign services
  async assignServices(doctorId: number, serviceIds: number[]) {
    const doctor = await this.doctorRepo.findOne({ where:
       { id: doctorId },
        relations: ['specialty'],
     }); 
    if (!doctor) throw new NotFoundException('Doctor not found');

    const services = await this.serviceRepo.find(
      { where: { id: In(serviceIds) },  
      relations: ['specialty'],
 });
    if (services.length !== serviceIds.length) {
      throw new NotFoundException('Some service IDs are invalid');
    }
    const invalidServices = services.filter(
      (s) => !s.specialty || s.specialty.id !== doctor.specialty.id
    );
  if (invalidServices.length > 0) {
    throw new BadRequestException(
`Services with IDs ${invalidServices.map(s => s.id).join(', ')} do not match the doctor's specialty`,
    );
  }

    await this.doctorServiceRepo.delete({ doctor: { id: doctorId } });

    const assignments = serviceIds.map((sid) =>
      this.doctorServiceRepo.create({ doctor: { id: doctorId }, service: { id: sid } }),
    );

    await this.doctorServiceRepo.save(assignments);

    return { message: 'Services assigned successfully', assignedServiceIds: serviceIds };
  }

  // ✅ Delete doctor
  async deleteDoctor(id: number) {
    const doctor = await this.doctorRepo.findOne({ where: { id }, relations: ['user'] });
    if (!doctor) throw new NotFoundException('Doctor not found');

    await this.userRepo.remove(doctor.user);
    return { message: 'Doctor and related user deleted successfully' };
  }
}
