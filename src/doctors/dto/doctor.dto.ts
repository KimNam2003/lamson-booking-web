import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsInt,
  IsPositive,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DoctorDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsPhoneNumber('VN') // hoặc 'ZZ' nếu không cố định quốc gia
  phone: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  specialtyId?: number;

  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  serviceIds?: number[]; // danh sách service id mà bác sĩ cung cấp
}
