import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import { DoctorServices } from 'src/doctor-services/entities/doctor-service.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { DoctorDayOff } from 'src/doctor-of-days/entities/doctor-off-day.enttity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears: number;

  @Column({ name: 'specialty_id', nullable: true })
  specialtyId: number;

  @ManyToOne(() => Specialty, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @OneToMany(() => DoctorServices, (ds) => ds.doctor)
  doctorServices: DoctorServices[];

  @OneToMany(() => Schedule, (schedule) => schedule.doctor)
  schedules: Schedule[];

  @OneToMany(() => DoctorDayOff, (dayOff) => dayOff.doctor)
  dayOffs: DoctorDayOff[];
}
