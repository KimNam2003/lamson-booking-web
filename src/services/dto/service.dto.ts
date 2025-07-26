import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  IsPositive,
} from 'class-validator';

export class ServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1) 
  duration_minutes?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  price?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  specialty_id?: number;
}
