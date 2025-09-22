import { Type } from 'class-transformer';
import { IsInt, IsDateString, IsDate, IsArray } from 'class-validator';

export class GenerateSlotDto {
  @IsArray()
  @IsInt({ each: true })
  scheduleIds: number[];

 @IsArray()
  serviceIds: number[];

  @IsDateString()
  date: string;
}
