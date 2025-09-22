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
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';
import { UserDto } from './dto/user.dto';
import { PatientDto } from 'src/patients/dto/patient.dto';
import { DoctorDto } from 'src/doctors/dto/doctor.dto';
import { Service } from 'src/services/entities/service.entity';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { CreateUserWithProfileDto } from './dto/create-user-with-profile.dto';
import { DoctorService } from 'src/doctors/doctor.service';
import { UploadAvatarService } from 'src/UploadAvatar/UploadAvatar.service';
import { PatientService } from 'src/patients/patient.service';
import { QueryUsersDto } from './dto/query-user.dto';

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

    @InjectRepository(DoctorServices)
    private readonly doctorServiceRepository: Repository<DoctorServices>,

    private readonly dataSource: DataSource, 

    private readonly doctorService : DoctorService,

    private readonly uploadAvatarService: UploadAvatarService,

    private readonly patientService : PatientService,



  ) {}

  async createUser(
    dto: CreateUserWithProfileDto,
    avatar?: Express.Multer.File,
  ): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, password, role, profile } = dto;

      // Kiểm tra SuperAdmin
      if (role === UserRole.SuperAdmin) {
        const superAdminExists = await queryRunner.manager.count(User, {
          where: { role: UserRole.SuperAdmin },
        });
        if (superAdminExists > 0) {
          throw new BadRequestException("SuperAdmin đã tồn tại, không thể tạo thêm");
        }
      }

      // Kiểm tra email đã tồn tại
      const existingUser = await queryRunner.manager.findOne(User, { where: { email } });
      if (existingUser) {
        throw new ConflictException("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user
      const newUser = this.userRepository.create({
        email,
        passwordHash: hashedPassword,
        role,
      });
      const savedUser = await queryRunner.manager.save(User, newUser);

      // Xử lý profile bác sĩ
      if (role === UserRole.Doctor) {
        const doctorDto = profile as DoctorDto;

        // Tạo doctor profile trước để có doctor.id
        const savedDoctor = await this.doctorService.createDoctorProfile(
          savedUser,
          doctorDto,
          queryRunner.manager,
        );

        // Nếu có avatar, lưu theo doctor.id
        if (avatar) {
          const avatarUrl = await this.uploadAvatarService.saveDoctorAvatar(
            avatar,
            savedDoctor.id,
          );
          savedDoctor.avatarUrl = avatarUrl;
          await queryRunner.manager.save(savedDoctor);
        }
      }

      // Xử lý profile bệnh nhân
      if (role === UserRole.Patient) {
        await this.patientService.createPatientProfile(
          savedUser,
          profile as PatientDto,
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  
 // Cập nhật email hoặc mật khẩu
  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Cập nhật email (nếu có)
    if (dto.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email đã được sử dụng');
      }
      user.email = dto.email;
    }

    // Cập nhật mật khẩu (nếu có)
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
  async getAllUsers(dto: QueryUsersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.userRepository.createQueryBuilder('u');

    if (dto.search) {
      qb.andWhere('u.email LIKE :email', { email: `%${dto.search}%` });
    }

    if (dto.role) {
      qb.andWhere('u.role = :role', { role: dto.role });
    }

    qb.orderBy('u.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users.map((u) => instanceToPlain(u)),
      total,
      page,
      limit,
    };
  }

  // async getUserProfile(userId: number | undefined) {
  //   if (!userId) {
  //     throw new BadRequestException('User ID is required');
  //   }

  //   // Lấy user cơ bản
  //   const user = await this.userRepository.findOne({ where: { id: userId } });
  //   if (!user) throw new NotFoundException('User not found');

  //   let profile: Patient | Doctor | null = null;
  //   if (user.role === UserRole.Patient) {
  //     profile = await this.patientRepository.findOne({
  //       where: { user: { id: userId } },
  //       relations: ['user'],
  //     });
  //   } else if (user.role === UserRole.Doctor) {
  //     profile = await this.doctorRepository.findOne({
  //       where: { user: { id: userId } },
  //       relations: ['user'],
  //     });
  //   }

  //   return {
  //     ...instanceToPlain(user),
  //     profile: profile ? instanceToPlain(profile) : null,
  //   };
  


  
}
