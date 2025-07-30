import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  patientId: number;

  @IsInt()
  slotId: number;

  @IsInt()
  serviceId: number;

  @IsOptional()
  @IsString()
  note?: string;
}
