import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/log-in.dto';
import { PatientService } from 'src/patients/patient.service';
import { DoctorService } from 'src/doctors/doctor.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private doctorService: DoctorService,
    private patientService: PatientService,
  ) {}

  async logIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm user theo email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Lấy roleId từ bảng role-specific
    let roleId: number | null = null;
    if (user.role === 'doctor') {
      const doctor = await this.doctorService.getDoctorByUserId(user.id);
      if (!doctor) throw new UnauthorizedException('Doctor not found');
      roleId = doctor.id;
    } else if (user.role === 'patient') {
      const patient = await this.patientService.getPatientByUserId(user.id);
      if (!patient) throw new UnauthorizedException('Patient not found');
      roleId = patient.id;
    }

    // Tạo payload cho JWT, thêm roleId
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      roleId, // nhúng roleId trực tiếp
    };

    // Tạo token
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
