import { SpecialtiesModule } from './specialties/specialties.module';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceModule } from './services/service.module';
import { UsersModule } from './users/users.module';
import { DoctorModule } from './doctors/doctor.module';
import { PatientModule } from './patients/patient.module';
import { AuthMiddleware } from './common/middleware/current-user.middleware';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedules/schedule.module';
import { AppointmentSlotModule } from './appointment-slots/appointment-slot.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DoctorDayOffModule } from './doctor-of-days/doctor-day-off.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
     TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities:true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), 
      serveRoot: '/public',
    }),SpecialtiesModule ,ServiceModule,UsersModule,DoctorModule,PatientModule,AuthModule,
    ScheduleModule,AppointmentSlotModule,AppointmentModule,DoctorDayOffModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
 export class AppModule {} //implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(AuthMiddleware) 
//       .exclude(
//         { path: 'auth/log-in', method: RequestMethod.POST },
//         { path: 'users/sign-up', method: RequestMethod.POST },
//       )
//       .forRoutes('*')
//       }
//     }