import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    // Include username and avatarUrl in payload for client
    const payload = { 
      email: user.email, 
      sub: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isSetUsername: !!user.username
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isSetUsername: !!user.username
      }
    };
  }

  async register(email: string, pass: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    // Check if user exists (by email OR providerId)
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: req.user.email },
          { providerId: req.user.providerId }
        ]
      }
    });

    if (existingUser) {
      // Update providerId if missing
      if (!existingUser.providerId) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { providerId: req.user.providerId, avatarUrl: req.user.picture }
        });
      }
      return this.login(existingUser);
    }

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email: req.user.email,
        providerId: req.user.providerId,
        avatarUrl: req.user.picture,
        // No password for Google users
      }
    });

    return this.login(newUser);
  }

  async setUsername(userId: string, username: string) {
    // Check if username exists
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) throw new ConflictException('Username already taken / ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { username },
    });
    
    // Return new token with username
    return this.login(user);
  }

  async updateProfile(userId: string, data: { username?: string; avatarUrl?: string }) {
    if (data.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId }
        }
      });
      if (existing) throw new ConflictException('Username already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data
    });
  }  

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    return result;
  }

  // --- Password Reset ---

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal user existence, just return success-like message
      return { message: 'If email exists, reset link sent.' };
    }

    // Generate temporary token (short expiry, e.g. 15m)
    // We use a different secret or payload structure if needed, but for simplicity here:
    const payload = { sub: user.id, type: 'reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    // TODO: Send email with link: FRONTEND_URL/reset-password?token=XYZ
    console.log(`[DEBUG] Reset Token for ${email}: ${token}`);

    // For Dev/Demo: Return token so user can test immediately
    return { 
      message: 'Reset link sent (check console/response for dev token)',
      devToken: token 
    };
  }

  async resetPassword(token: string, newPass: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'reset') throw new UnauthorizedException('Invalid token type');

      const userId = payload.sub;
      const hashedPassword = await bcrypt.hash(newPass, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return { message: 'Password reset successful' };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
