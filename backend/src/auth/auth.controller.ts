import { Controller, Post, Body, UseGuards, Request, Get, Req, Res, UnauthorizedException, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { SupabaseService } from '../supabase.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  @Post('upload-avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async uploadAvatar(@UploadedFile() file: any) {
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    const fileName = `${randomName}${extname(file.originalname)}`;
    const filePath = `avatars/${fileName}`;

    const publicUrl = await this.supabaseService.uploadFile(
      'uploads',
      filePath,
      file.buffer,
      file.mimetype,
    );

    return { url: publicUrl };
  }

  @Post('login')
  async login(@Body() req) {
    const identifier = req.identifier || req.email;
    const user = await this.authService.validateUser(identifier, req.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() req) {
    return this.authService.register(req.email || undefined, req.password, req.phone || undefined);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = (await this.authService.googleLogin(req)) as any;
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

    if (!result || !result.access_token) {
        return res.redirect(`${frontendUrl}/login?error=GoogleAuthFailed`);
    }
    const token = result.access_token;
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(@Req() req, @Body() body: { username?: string; avatarUrl?: string }) {
    return this.authService.updateProfile(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('set-username')
  async setUsername(@Request() req, @Body('username') username: string) {
    // req.user from JwtStrategy = { userId: ..., email: ... }
    return this.authService.setUsername(req.user.userId, username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new UnauthorizedException('Email is required');
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    if (!body.token || !body.newPassword) throw new UnauthorizedException('Token and New Password required');
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
