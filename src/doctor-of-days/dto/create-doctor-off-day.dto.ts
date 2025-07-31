import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDoctorDayOffDto {
  @IsInt()
  doctorId: number;

  @IsDateString()
  date: string; // ví dụ: '2025-08-01'

  @IsOptional()
  @IsString()
  reason?: string;
}
