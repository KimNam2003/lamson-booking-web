import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class UpdateDoctorDto {

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  specialtyId: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  experienceYears?: number;
}
