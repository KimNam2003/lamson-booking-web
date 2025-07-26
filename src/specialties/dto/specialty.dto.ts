import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class SpecialtyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
