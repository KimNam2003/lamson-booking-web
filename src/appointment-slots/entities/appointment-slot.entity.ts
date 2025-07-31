import { Appointment } from "src/appointment/entities/appointment.entity";
import { Doctor } from "src/doctors/entities/doctor.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";
import { Service } from "src/services/entities/service.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('appointment_slots')
export class AppointmentSlot {
  @PrimaryGeneratedColumn()
  id: number;

   @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @Column({ name: 'schedule_id' })
  scheduleId: number;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_id' })
  serviceId: number;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ name: 'is_booked', default: false })
  isBooked: boolean;

  @OneToOne(() => Appointment, (appointment) => appointment.slot)
  appointment: Appointment; 
}