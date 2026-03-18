import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    const isPhone = /^[0-9+\-\s()]{8,15}$/.test(identifier.trim());
    const user = await this.prisma.user.findFirst({
      where: isPhone
        ? { phone: identifier.trim() }
        : { email: identifier.trim().toLowerCase() },
    });
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

  async register(email: string | undefined, pass: string, phone?: string) {
    if (!email && !phone) {
      throw new ConflictException('Email or phone is required');
    }

    if (email) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) throw new ConflictException('Email already exists');
    }

    if (phone) {
      const phoneExists = await this.prisma.user.findUnique({ where: { phone } });
      if (phoneExists) throw new ConflictException('Phone already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
      data: {
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
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
      return { message: 'If email exists, reset link sent.' };
    }

    const payload = { sub: user.id, type: 'reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"บุ๊คเลข Heng-Heng" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔑 รีเซ็ตรหัสผ่าน - บุ๊คเลข Heng-Heng',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f5ff; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">🙏 บุ๊คเลข</h1>
            <p style="color: #6b7280; margin-top: 8px;">Heng-Heng.app</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #1f2937; margin-top: 0;">รีเซ็ตรหัสผ่านของคุณ</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ<br>
              กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}"
                style="background: linear-gradient(135deg, #d97706, #ea580c); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                🔑 ตั้งรหัสผ่านใหม่
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
              ลิงก์นี้จะหมดอายุใน <strong>15 นาที</strong><br>
              หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้
            </p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">✨ HENG-HENG.APP ✨</p>
        </div>
      `,
    });

    return { message: 'Reset link sent to your email.' };
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
