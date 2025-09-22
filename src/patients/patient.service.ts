import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PatientDto } from './dto/patient.dto';
import { Gender } from 'src/common/enums/gender.enum';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createPatientProfile(user: User, dto: PatientDto, manager: EntityManager): Promise<Patient> {
  const patient = manager.create(Patient, {
    user,
    fullName: dto.fullName,
    phone: dto.phone,
    dateOfBirth: dto.dateOfBirth,
    gender: dto.gender,
    address: dto.address,
    // Bổ sung các field khác nếu có
  });

  return await manager.save(Patient, patient);
}


  // 1. Get patient by id
  async getPatientById(id: number) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  // 2. Get all patients (pagination)

  async getAllPatients(
    page = 1,
    limit = 10,
    userId?: number,
    fullName?: string,
    gender?: Gender,
  ) {
    const query = this.patientRepo
        .createQueryBuilder('patient')
        .leftJoinAndSelect('patient.user', 'user');
        
    if (userId) {
      query.andWhere('patient.userId = :userId', { userId });
    }

    if (fullName) {
      query.andWhere('patient.fullName LIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }

    if (gender) {
      query.andWhere('patient.gender = :gender', { gender });
    }
    query.orderBy('patient.id', 'DESC');

    query.skip((page - 1) * limit).take(limit);

    const [patients, total] = await query.getManyAndCount();

    return {
      data: patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPatientByUserId(userId: number) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } }, // vì user là object quan hệ
    });

    if (!patient) {
      throw new NotFoundException(`Patient with userId ${userId} not found`);
    }

    return patient;
  }

  // 3. Update patient
  async updatePatient(id: number, dto: PatientDto) {
    const patient = await this.patientRepo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');

    Object.assign(patient, dto);
    return this.patientRepo.save(patient);
  }

  // 4. Delete patient (and user cascade)
  async deletePatient(id: number) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!patient) throw new NotFoundException('Patient not found');

    await this.userRepo.remove(patient.user);

    return { message: 'Patient and related user deleted successfully' };
  }
}
