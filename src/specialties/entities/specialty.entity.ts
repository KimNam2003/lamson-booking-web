import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Service } from 'src/services/entities/service.entity'; // đường dẫn tùy theo cấu trúc project của bạn

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @OneToMany(() => Service, (service) => service.specialty)
  services: Service[];
}
