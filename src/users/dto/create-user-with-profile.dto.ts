// dto/create-user-with-profile.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { DoctorDto } from 'src/doctors/dto/doctor.dto';
import { PatientDto } from 'src/patients/dto/patient.dto';
import { UserRole } from 'src/common/enums/role.enum';

export class CreateUserWithProfileDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
  

 @IsOptional()
  profile?: DoctorDto | PatientDto;
}
