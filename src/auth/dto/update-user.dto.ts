import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  email?: string;

  @IsOptional()
  newPassword?: string;

  @IsOptional()
  oldPassword: string;
}
