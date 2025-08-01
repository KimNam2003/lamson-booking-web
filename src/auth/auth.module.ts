import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret:  process.env.JWT_SECRET,
      signOptions:{expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}