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
import { UploadAvatarService } from 'src/UploadAvatar/UploadAvatar.service';
import { Service } from 'src/services/entities/service.entity';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,

    private readonly uploadAvatarService: UploadAvatarService,
    
  ) {}

   // Tạo mới chuyên khoa
  async create(
  dto: SpecialtyDto,
  image?: Express.Multer.File,): Promise<Specialty> {
  const existed = await this.specialtyRepo.findOneBy({ name: dto.name });
  if (existed) {
    throw new ConflictException('Chuyên khoa này đã tồn tại');
  }

  let imageUrl: string | undefined;
  if (image) {
    imageUrl = await this.uploadAvatarService.saveSpecialty(image, dto.name);
  }

  const specialty = this.specialtyRepo.create({
    ...dto,
    imageUrl,
  });

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
  async update(id: number,specialtyDto: SpecialtyDto,
    image?: Express.Multer.File): Promise<Specialty> {

    const specialty = await this.specialtyRepo.findOneBy({ id });
    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }

    const duplicate = await this.specialtyRepo.findOneBy({ name: specialtyDto.name });
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(`Specialty name "${specialtyDto.name}" is already in use`);
    }

    // Nếu có ảnh mới thì upload và cập nhật imageUrl
    if (image) {
      const imageUrl = await this.uploadAvatarService.saveSpecialty(image, specialtyDto.name);
      specialty.imageUrl = imageUrl;
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

  async getServicesBySpecialtyId(specialtyId: number): Promise<Service[]> {
    const specialty = await this.specialtyRepo.findOne({
      where: { id: specialtyId },
      relations: ['services'], // tên phải đúng với tên trong entity
    });

    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${specialtyId} not found`);
    }

    return specialty.services;
  }


}
