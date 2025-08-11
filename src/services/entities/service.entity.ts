// src/services/entities/service.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  duration_minutes: number;

  @Column('decimal')
  price: number;

  @ManyToOne(() => Specialty, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;
  
  @OneToMany(() => DoctorServices, doctorServices => doctorServices.service)
  doctorServices: DoctorServices[];

  @Column({ type: 'text', nullable: true })
  target_patient?: string;

  @Column({ type: 'text', nullable: true })
  benefit?: string;

  @Column({ type: 'text', nullable: true })
  preparation?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // @OneToMany(() => AppointmentSlot, (slot) => slot.service)
  // appointmentSlots: AppointmentSlot[];
}