// src/appointment/entities/appointment.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AppointmentSlot, { eager: true })
  @JoinColumn({ name: 'slot_id' })
  slot: AppointmentSlot;

  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
