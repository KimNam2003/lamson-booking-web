import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Specialty } from '../specialties/entities/specialty.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Specialty])],
  controllers: [ServiceController],
  providers: [ServiceService]
  
})
export class ServiceModule {}
