import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/common/enums/role.enum';

export class UserDto {
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsEnum(UserRole)
  role?: UserRole;

}
