// src/services/entities/service.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Specialty } from '../../specialties/entities/specialty.entity';

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
