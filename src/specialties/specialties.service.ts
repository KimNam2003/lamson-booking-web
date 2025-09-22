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
import { ListSpecialtyQueryDto } from './dto/specialty-query-dto';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,

    private readonly uploadAvatarService: UploadAvatarService,
  ) {}

  // ✅ Tạo mới chuyên khoa
  async create(
    dto: SpecialtyDto,
    image?: Express.Multer.File,
  ): Promise<Specialty> {
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

  // ✅ Tìm kiếm chuyên khoa (gộp findAll, findOne, getByService)
  async findSpecialties(query: ListSpecialtyQueryDto) {
    const { specialtyId, name, description, service_id, page, limit } = query;

    const qb = this.specialtyRepo
      .createQueryBuilder('specialty')
      .leftJoinAndSelect('specialty.services', 'service');

    if (specialtyId) {
      qb.andWhere('specialty.id = :specialtyId', { specialtyId });
    }

    if (name) {
      qb.andWhere('specialty.name LIKE :name', { name: `%${name}%` });
    }

    if (description) {
      qb.andWhere('specialty.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (service_id) {
      qb.andWhere('service.id = :service_id', { service_id });
    }

    qb.orderBy('specialty.id', 'ASC');

    let data: Specialty[];
    let total: number;

    if (page && limit) {
      qb.skip((page - 1) * limit);
      qb.take(limit);
      [data, total] = await qb.getManyAndCount();
    } else {
      data = await qb.getMany();
      total = data.length;
    }

    if (specialtyId && data.length === 0) {
      throw new NotFoundException(`Không tìm thấy chuyên khoa với ID ${specialtyId}`);
    }

    return {
      data,
      total,
      ...(page && limit
        ? {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          }
        : {}),
    };
  }

  // ✅ Cập nhật
  async update(
    id: number,
    specialtyDto: SpecialtyDto,
    image?: Express.Multer.File,
  ): Promise<Specialty> {
    const specialty = await this.specialtyRepo.findOneBy({ id });
    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }

    const duplicate = await this.specialtyRepo.findOneBy({
      name: specialtyDto.name,
    });
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(
        `Specialty name "${specialtyDto.name}" is already in use`,
      );
    }

    Object.assign(specialty, specialtyDto);
    if (image) {
      const imageUrl = await this.uploadAvatarService.saveSpecialty(
        image,
        specialtyDto.name,
      );
      specialty.imageUrl = imageUrl;
    }

    try {
      return await this.specialtyRepo.save(specialty);
    } catch (error) {
      throw new BadRequestException(`Failed to update specialty: ${error.message}`);
    }
  }

  // ✅ Xoá
  async remove(id: number): Promise<{ message: string }> {
    const specialty = await this.specialtyRepo.findOneBy({ id });
    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${id} not found`);
    }

    await this.specialtyRepo.delete(id);
    return { message: `Delete successful with ID ${id}` };
  }
}
