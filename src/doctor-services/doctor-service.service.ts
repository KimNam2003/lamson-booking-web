import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Service } from 'src/services/entities/service.entity';
import { DoctorServices } from './entities/doctor-service.entity';

@Injectable()
export class DoctorServicesService {
  constructor(
    @InjectRepository(DoctorServices)
    private readonly doctorServiceRepo: Repository<DoctorServices>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

   //1. Gán các dịch vụ cho một bác sĩ (ghi đè toàn bộ danh sách cũ)
  async assignServicesToDoctor(doctorId: number, serviceIds: number[]) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (!serviceIds.length) {
      throw new BadRequestException('Service IDs must not be empty');
    }

    const services = await this.serviceRepo.find({ where: { id: In(serviceIds) } });
    if (services.length !== serviceIds.length) {
      throw new NotFoundException('Some service IDs are invalid');
    }

    await this.doctorServiceRepo.delete({ doctor: { id: doctorId } });

    // Gán mới
    const newAssignments = serviceIds.map(serviceId =>
      this.doctorServiceRepo.create({
        doctor: { id: doctorId },
        service: { id: serviceId },
      }),
    );

    await this.doctorServiceRepo.save(newAssignments);

    return {
      message: 'Services re-assigned successfully',
      assignedServiceIds: serviceIds,
    };
  }

  //1. Gán các bác sĩ cho một dịch vụ  (ghi đè toàn bộ danh sách cũ)
  async assignDoctorsToService(serviceId: number, doctorIds: number[]) {
    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Service not found');

    if (!doctorIds.length) {
        throw new BadRequestException('Doctor IDs must not be empty');
    }

    const doctors = await this.doctorRepo.find({ where: { id: In(doctorIds) } });
    if (doctors.length !== doctorIds.length) {
        throw new NotFoundException('Some doctor IDs are invalid');
    }

    // Xoá các liên kết cũ của dịch vụ này
    await this.doctorServiceRepo.delete({ service: { id: serviceId } });

    // Gán mới
    const newAssignments = doctorIds.map(doctorId =>
        this.doctorServiceRepo.create({
        doctor: { id: doctorId },
        service: { id: serviceId },
        }),
    );

    await this.doctorServiceRepo.save(newAssignments);

    return {
        message: 'Doctors assigned to service successfully',
        assignedDoctorIds: doctorIds,
    };
    }
   // Lấy danh sách bác sĩ theo serviceId
  async getDoctorsByServiceId(serviceId: number): Promise<Doctor[]> {
    const links = await this.doctorServiceRepo.find({
      where: { service: { id: serviceId } },
      relations: ['doctor', 'doctor.specialty'],
    });

    return links.map(link => link.doctor);
  }

    //Lấy danh sách service đã gán cho bác sĩ
  async getServiceIdsByDoctor(doctorId: number): Promise<number[]> {
    const links = await this.doctorServiceRepo.find({
      where: { doctor: { id: doctorId } },
      relations: ['service'],
    });

    return links.map(link => link.service.id);
  }


}
