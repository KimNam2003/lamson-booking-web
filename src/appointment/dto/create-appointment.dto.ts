import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {

  @IsInt()
  slotId: number;

  @IsOptional()
  @IsString()
  note?: string;
}
