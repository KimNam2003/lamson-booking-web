// dto/query-doctor-day-off.dto.ts
import { IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { DoctorDayOffStatus } from 'src/common/enums/doctor-day-off-status.enum';

export class QueryDoctorDayOffDto {
  @IsOptional()
  @IsNumber()
  doctorId?: number;

  @IsOptional()
  @IsEnum(DoctorDayOffStatus)
  status?: DoctorDayOffStatus;

  @IsOptional()
  @IsDateString()
  date?: string; // Lọc theo ngày cụ thể
}
