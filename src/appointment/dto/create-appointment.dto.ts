import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  patientId: number;

  @IsInt()
  slotId: number;

  @IsOptional()
  @IsString()
  note?: string;
}
