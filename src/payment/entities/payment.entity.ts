import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  // Relation với Appointment
  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id', nullable: false })
  appointmentId: number;

  // Relation với Patient
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id', nullable: false })
  patientId: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'enum', enum: ['cash', 'credit_card', 'momo', 'zalopay', 'vnpay', 'paypal'], default: 'vnpay' })
  method: string;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' })
  status: string;

  @Column({ name: 'transaction_code', length: 100, nullable: true })
  transactionCode: string;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
