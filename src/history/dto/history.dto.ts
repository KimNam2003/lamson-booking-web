import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicalHistoryDto {
  @IsOptional()
  @Type(() => Number)  
  @IsInt()
  appointmentId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  diagnosis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  prescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;
}
