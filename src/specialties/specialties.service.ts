import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import { SpecialtyDto } from './dto/specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,
  ) {}

   // Tạo mới chuyên khoa
  async create(SpecialtyDto: SpecialtyDto): Promise<Specialty> {
    // Kiểm tra trùng tên
    const existed = await this.specialtyRepo.findOneBy({ name: SpecialtyDto.name });
    if (existed) {
      throw new ConflictException('Chuyên khoa này đã tồn tại');
    }
    const specialty = this.specialtyRepo.create(SpecialtyDto);
    try {
      return await this.specialtyRepo.save(specialty);
    } catch (err) {
      throw new BadRequestException('Lỗi khi lưu chuyên khoa: ' + err.message);
    }
  }

  // Lấy danh sách tất cả chuyên khoa
  async findAll(): Promise<Specialty[]> {
    return this.specialtyRepo.find();
  }

  async findOne(id: number): Promise<Specialty> {
    const specialty = await this.specialtyRepo.findOneBy({ id });
    if (!specialty) {
      throw new NotFoundException(`Không tìm thấy chuyên khoa với ID ${id}`);
    }
    return specialty;
  }

// Cập nhật thông tin chuyên khoa
async update(id: number, specialtyDto: SpecialtyDto): Promise<Specialty> {
  const specialty = await this.specialtyRepo.findOneBy({ id });
  if (!specialty) {
    throw new NotFoundException(`Specialty with ID ${id} not found`);
  }

  const duplicate = await this.specialtyRepo.findOneBy({ name: specialtyDto.name });
  if (duplicate && duplicate.id !== id) {
    throw new ConflictException(`Specialty name "${specialtyDto.name}" is already in use`);
  }
  Object.assign(specialty, specialtyDto);
  
  try {
    return await this.specialtyRepo.save(specialty);
  } catch (error) {
    throw new BadRequestException(`Failed to update specialty: ${error.message}`);
  }
}

// Xoá chuyên khoa bằng id
  async remove(id: number): Promise<{ message: string }> {
    const specialty = await this.specialtyRepo.findOneBy({ id });
    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }
    await this.specialtyRepo.delete(id);
    return { message: `Delete successful with ID ${id}` };
  }

}
