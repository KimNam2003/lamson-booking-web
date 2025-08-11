import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsPositive, 
  IsString, 
  MaxLength, 
  Min 
} from 'class-validator';

export class ServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'duration_minutes must be at least 1 minute' })
  duration_minutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'price must be a positive number' })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'specialty_id must be a positive integer' })
  specialty_id?: number;

  @IsString()
  @IsOptional()
  target_patient?: string;

  @IsString()
  @IsOptional()
  benefit?: string;

  @IsString()
  @IsOptional()
  preparation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
