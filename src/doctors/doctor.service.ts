import {Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { EntityManager, Repository } from 'typeorm';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { DoctorDto } from './dto/doctor.dto';
import { User } from 'src/users/entities/user.entity';
import { UploadAvatarService } from 'src/UploadAvatar/UploadAvatar.service';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,

    @InjectRepository(User)
    private readonly userServiceRepo: Repository<User>,

    private readonly uploadAvatarService: UploadAvatarService,


  ) {}

  async createDoctorProfile(user: User, dto: DoctorDto, manager: EntityManager): Promise<Doctor> {
    const specialty = await manager.findOne(Specialty, {
      where: { id: dto.specialtyId },
    });

    if (!specialty) {
      throw new NotFoundException('Specialty not found');
    }

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
   async updateDoctor(id: number, dto: DoctorDto, file?: Express.Multer.File,) {

    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Cập nhật specialty nếu có
    if (dto.specialtyId) {
      const specialty = await this.specialtyRepo.findOne({
        where: { id: dto.specialtyId },
      });
      if (!specialty) throw new NotFoundException('Specialty not found');
      doctor.specialty = specialty;
    }

    // Cập nhật ảnh nếu có
    if (file) {
      const avatarUrl = await this.uploadAvatarService.saveDoctorAvatar(
        file,
        id,
      );
      doctor.avatarUrl = avatarUrl;
    }

    Object.assign(doctor, dto);

    return this.doctorRepo.save(doctor);
  }



  // 6. Delete doctor by id 
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
  

  //7. searrch doctor
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