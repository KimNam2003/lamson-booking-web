import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

import { User } from './entities/user.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { DoctorService } from 'src/doctor-services/entities/doctor-service.entity';
import { UserDto } from './dto/user.dto';
import { PatientDto } from 'src/patients/dto/patient.dto';
import { DoctorDto } from 'src/doctors/dto/doctor.dto';
import { Service } from 'src/services/entities/service.entity';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,

    @InjectRepository(DoctorService)
    private readonly doctorServiceRepository: Repository<DoctorService>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    private readonly dataSource: DataSource, 

  ) {}

  async createUser(userDto: UserDto, profileData: DoctorDto | PatientDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, password, role } = userDto;

      const existingUser = await queryRunner.manager.findOne(User, { where: { email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = this.userRepository.create({
        email,
        passwordHash: hashedPassword,
        role,
      });

      const savedUser = await queryRunner.manager.save(User, newUser);

      if (role === UserRole.Doctor) {
        const doctorDto = profileData as DoctorDto;
        const { specialtyId, serviceIds = [], ...restDoctorDto } = doctorDto;

        const specialty = await queryRunner.manager.findOne(Specialty, {
          where: { id: specialtyId },
        });
        if (!specialty) {
          throw new NotFoundException('Specialty not found');
        }

        const doctor = this.doctorRepository.create({
          ...restDoctorDto,
          specialty,
          user: savedUser,
        });

        const savedDoctor = await queryRunner.manager.save(Doctor, doctor);

        if (serviceIds.length > 0) {
          const services = await queryRunner.manager.find(Service, {
            where: { id: In(serviceIds) },
          });

          if (services.length !== serviceIds.length) {
            throw new NotFoundException('Some service IDs are invalid');
          }

          const doctorServices = services.map((service) =>
            this.doctorServiceRepository.create({
              doctor: savedDoctor,
              service,
            }),
          );

          await queryRunner.manager.save(DoctorService, doctorServices);
        }
      }

      if (role === UserRole.Patient) {
        const patientDto = profileData as PatientDto;

        const patient = this.patientRepository.create({
          ...patientDto,
          user: savedUser,
        });

        await queryRunner.manager.save(Patient, patient);
      }

      await queryRunner.commitTransaction();
      return instanceToPlain(savedUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
 // Cập nhật email hoặc mật khẩu
  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Nếu muốn cập nhật email hoặc mật khẩu thì phải xác nhận mật khẩu cũ
    if (dto.email || dto.newPassword) {
      if (!dto.oldPassword) {
        throw new BadRequestException('Vui lòng nhập mật khẩu cũ để xác nhận');
      }

      const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu cũ không đúng');
      }
    }

    // Cập nhật email nếu có
    if (dto.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email đã được sử dụng');
      }
      user.email = dto.email;
    }

    // Cập nhật mật khẩu nếu có
    if (dto.newPassword) {
      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    }

    await this.userRepository.save(user);
    return { message: 'Cập nhật thông tin người dùng thành công' };
  }

  // ✅ Người dùng tự xoá
  async deleteUser(id: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);
    return 'Tài khoản đã được xoá';
  }

  // ✅ Admin xoá người dùng
  async deleteUserByAdmin(id: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);
    return 'Người dùng đã bị admin xoá';
  }

  // ✅ Lấy người dùng theo id
  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return instanceToPlain(user);
  }

  // ✅ Lấy danh sách người dùng (có tìm kiếm và phân trang)
  async getAllUsers(search = '', page = 1, limit = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      where: search
        ? [{ email: Like(`%${search}%`) }]
        : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data: users.map((u) => instanceToPlain(u)),
      total,
      page,
      limit,
    };
  }
}
