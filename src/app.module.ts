import { MiddlewareConsumer, Module, NestModule, RequestMethod, Get } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SpecialtiesModule } from './specialties/specialties.module';
import { AuthMiddleware } from './common/middleware/current-user.middleware';
import { AuthModule } from './auth/auth.module';
import { ServiceModule } from './services/service.module';
import { DoctorModule } from './doctors/doctor.module';
import { PatientModule } from './patients/patient.module';
import { AppointmentSlotModule } from './appointment-slots/appointment-slot.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DoctorDayOffModule } from './doctor-of-days/doctor-day-off.module';
import { MedicalHistoryModule } from './history/history.module';
import { SchedulesModule } from './schedules/schedule.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentModule } from './payment/payment.module';
import { MailModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
    }),

    // Serve static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public') 
    }),

    SpecialtiesModule,
    ServiceModule,
    UsersModule,
    DoctorModule,
    PatientModule,
    AuthModule,
    SchedulesModule,
    AppointmentSlotModule,
    AppointmentModule,
    DoctorDayOffModule,
    MedicalHistoryModule,
    PaymentModule,
    MailModule,
     ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
 export class AppModule implements NestModule {
 configure(consumer: MiddlewareConsumer) {
  
  consumer
    .apply(AuthMiddleware)
    .exclude(
      { path: 'auth/log-in', method: RequestMethod.POST },
      { path: 'users/sign-up', method: RequestMethod.POST },
      { path: 'specialties/(.*)', method: RequestMethod.GET }, // API /specialties vẫn bị bảo vệ
      { path: 'doctors/*path', method: RequestMethod.GET },
      { path: 'services/(.*)', method: RequestMethod.GET }

      
      
    ) 
    .forRoutes(
      { path: 'users/*path', method: RequestMethod.ALL },
      // { path: 'doctors', method: RequestMethod.ALL },
      { path: 'appointments', method: RequestMethod.ALL },
      { path: 'doctors/*path', method: RequestMethod.ALL },
      { path: 'appointments/(.*)', method: RequestMethod.ALL },
      { path: 'services/(.*)', method: RequestMethod.ALL },
      { path: 'specialties/(.*)', method: RequestMethod.ALL } 
    );
  }
}
