import { IsInt, IsDateString } from 'class-validator';

export class GenerateSlotDto {
  @IsInt()
  scheduleId: number;

  @IsInt()
  serviceId: number;

  @IsDateString()
  date: string; // YYYY-MM-DD (ví dụ: '2025-08-01')
}
