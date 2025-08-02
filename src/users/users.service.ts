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

    const existingUser = await queryRunner.manager.findOne(User, {
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      role,
    });

    const savedUser = await queryRunner.manager.save(User, newUser);

    let avatarUrl: string | undefined;
    if (avatar) {
      avatarUrl = await this.uploadAvatarService.saveDoctorAvatar(avatar, savedUser.id);
    }

    if (role === UserRole.Doctor) {
      const doctorDto = profile as DoctorDto;
      if (avatarUrl) {
        doctorDto.avatarUrl = avatarUrl;
      }
      await this.doctorService.createDoctorProfile(savedUser, doctorDto,queryRunner.manager);
    }

    if (role === UserRole.Patient) {
      await this.patientService.createPatientProfile(savedUser, profile as PatientDto,queryRunner.manager);
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

    if (dto.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email đã được sử dụng');
      }
      user.email = dto.email;
    }

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
