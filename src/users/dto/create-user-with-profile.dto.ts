// dto/create-user-with-profile.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from 'src/common/enums/role.enum';

export class CreateUserWithProfileDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
  
  @IsOptional()
  profile: any;
}
