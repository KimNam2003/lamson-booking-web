import { SpecialtiesModule } from './specialties/specialties.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceModule } from './services/service.module';

@Module({
  imports: [ConfigModule.forRoot(),
     TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities:true
    }),SpecialtiesModule ,ServiceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
