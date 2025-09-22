// src/medical-history/entities/medical-history.entity.ts
import { Appointment } from 'src/appointment/entities/appointment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('medical_history')
export class MedicalHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  prescription: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Quan hệ 1-1 với Appointment
  @OneToOne(() => Appointment, (appointment) => appointment.medicalHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
