import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateIf } from 'class-validator';

export class ServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  specialty_id?: number;
}