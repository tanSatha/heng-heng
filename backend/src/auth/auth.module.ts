import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'my-super-secret-key-123',
      signOptions: { expiresIn: '90d' },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
