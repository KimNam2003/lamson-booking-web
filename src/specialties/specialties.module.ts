import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { Specialty } from './entities/specialty.entity';
import { UploadModule } from 'src/UploadAvatar/UploadAvatar.module';
import { Service } from 'src/services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specialty,Service]),UploadModule],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
  
})
export class SpecialtiesModule {}
