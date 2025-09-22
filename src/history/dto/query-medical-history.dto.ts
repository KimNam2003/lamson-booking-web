import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class QueryMedicalHistoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number ;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number ;

  @IsOptional()
  @IsString()
  search?: string; // tìm theo summary, diagnosis,...

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;
}
