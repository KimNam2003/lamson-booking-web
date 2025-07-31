import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' }) // 👈 Thêm dòng này để match với tên cột trong DB
  doctor: Doctor;

  @Column({ type: 'enum', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] })
  weekday: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;
}
