import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('doctor_day_offs')
@Unique(['doctor', 'date']) // Mỗi bác sĩ chỉ nghỉ 1 lần trong 1 ngày
export class DoctorDayOff {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.dayOffs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'date', name: 'day_off' })
  date: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
