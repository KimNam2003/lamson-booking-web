import { Type } from 'class-transformer';
import { IsInt, IsDateString, IsDate } from 'class-validator';

export class GenerateSlotDto {
  @IsInt()
  scheduleId: number;

  @IsInt()
  serviceId: number;

  @IsDateString()
  date: string;
}
