import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListDoctorQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  specialtyId?: number; // ✅ camelCase

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceId?: number; // ✅ camelCase

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceYears?: number; // ✅ camelCase

  @IsOptional()
  @IsString()
  fullName?: string; // ✅ camelCase

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
