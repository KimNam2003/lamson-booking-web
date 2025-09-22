// src/appointment/entities/appointment.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { AppointmentSlot } from 'src/appointment-slots/entities/appointment-slot.entity';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';
import { MedicalHistory } from 'src/history/entities/history.entity';
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AppointmentSlot) 
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

  @Column()
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => MedicalHistory, (history) => history.appointment)
  medicalHistory: MedicalHistory;
}
