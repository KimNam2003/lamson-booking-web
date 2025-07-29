import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class DoctorDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  specialtyId: number;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;
}
