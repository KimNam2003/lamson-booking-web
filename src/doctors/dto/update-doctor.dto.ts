import { IsOptional, IsString, IsInt, IsPhoneNumber, IsUrl, Min,
 MaxLength} from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsInt()
  specialtyId?: number;
}
