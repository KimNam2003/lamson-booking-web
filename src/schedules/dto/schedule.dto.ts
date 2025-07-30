import { IsEnum, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
import { Weekday } from 'src/common/enums/weekday.enum';

export class ScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  doctorId: number;

  @IsNotEmpty()
  @IsEnum(Weekday, { message: 'weekday must be a valid day of the week' })
  weekday: Weekday;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;
}
