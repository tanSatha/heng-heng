import { Controller, Post, Get, Delete, Body, UseGuards, Request, Req, Query, UploadedFile, UseInterceptors, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { LotteryService } from './lottery.service';
import { AuthGuard } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LotteryType } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase.service';

@Controller('lottery')
export class LotteryController {
  constructor(
    private readonly lotteryService: LotteryService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('user-recent-history')
  async getRecent(@Request() req, @Query('limit') limit?: number) {
    console.log('GET /lottery/recent hit', req.user);
    return this.lotteryService.getRecentRecords(req.user, limit ? Number(limit) : 5);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user-wins')
  async getUserWins(@Request() req) {
    // TEMPORARY: Ensure at least one mock win exists
    await this.lotteryService.makeMockWin();
    return this.lotteryService.getUserWins(req.user);
  }

  @Get('make-mock-win')
  async makeMockWin() {
    return this.lotteryService.makeMockWin();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('debug-user')
  getDebugUser(@Request() req) {
    return {
      message: 'Debugger',
      user: req.user,
      time: new Date().toISOString()
    };
  }

  @Get('nearby-places')
  async getNearbyPlaces(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('keyword') keyword?: string,
    @Query('limit') limitArgs?: string
  ) {
    if (!lat || !lng) return [];

    const limitParams = parseInt(limitArgs || '20');
    const googleApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';

    if (!googleApiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not set');
      return [];
    }

    const calcDist = (pLat: number, pLon: number) => {
      const R = 6371;
      const dLat = (pLat - Number(lat)) * Math.PI / 180;
      const dLon = (pLon - Number(lng)) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(Number(lat) * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const formatResults = (results: any[]) =>
      results
        .map((place: any) => {
          const pLat = place.geometry?.location?.lat;
          const pLon = place.geometry?.location?.lng;
          const dist = pLat && pLon ? calcDist(pLat, pLon) : null;
          return {
            name: place.name,
            vicinity: place.vicinity || 'ใกล้ฉัน',
            distanceVal: dist ?? 9999,
            distance: dist === null ? 'ใกล้เคียง' : dist < 1 ? `${(dist * 1000).toFixed(0)} ม.` : `${dist.toFixed(1)} กม.`,
          };
        })
        .sort((a: any, b: any) => a.distanceVal - b.distanceVal)
        .slice(0, limitParams);

    const search = async (params: Record<string, any>) => {
      const { data } = await firstValueFrom(
        this.httpService.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
          params: { location: `${lat},${lng}`, language: 'th', key: googleApiKey, ...params },
          timeout: 8000,
        })
      );
      return data;
    };

    try {
      // 1st try: place_of_worship + keyword
      const searchKeyword = keyword || 'วัด';
      let data = await search({ radius: 10000, type: 'place_of_worship', keyword: searchKeyword });

      // 2nd try: broader keyword only, no type filter
      if (!data?.results?.length || data.status === 'ZERO_RESULTS') {
        data = await search({ radius: 10000, keyword: searchKeyword });
      }

      if (!data?.results?.length) return [];

      return formatResults(data.results);

    } catch (error) {
      console.error('Google Places API Error:', error.message);
      return [];
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createRecord(@Request() req, @Body() body: { numbers: string; temple_name: string; type: LotteryType; draw_date: string; photo_url?: string; photo_url_2?: string }) {
    try {
      return await this.lotteryService.createLottery(req.user, body);
    } catch (error) {
       const { BadRequestException } = require('@nestjs/common');
       throw new BadRequestException(error.message);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async uploadLotteryImage(@UploadedFile() file: any) {
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    const fileName = `${randomName}${extname(file.originalname)}`;
    const filePath = `lottery/${fileName}`;

    const publicUrl = await this.supabaseService.uploadFile(
      'uploads',
      filePath,
      file.buffer,
      file.mimetype,
    );

    return { url: publicUrl };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-stats')
  async getMyStats(@Request() req) {
    return this.lotteryService.getUserStats(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getLotteryById(@Request() req, @Param('id') id: string) {
    return this.lotteryService.getLotteryById(Number(id), req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteRecord(@Request() req, @Param('id') id: string) {
    return this.lotteryService.deleteRecord(Number(id), req.user);
  }

  // Admin / Cron Trigger
  @Post('scrape-lao-result')
  async triggerScrapeLao() {
    return this.lotteryService.scrapeLaoLottery();
  }

  @Post('scrape-thai-result')
  async triggerScrapeThai() {
    return this.lotteryService.scrapeThaiLottery();
  }

  // Generic endpoint to get drawing results
  @Get('results/:type')
  async getLotteryResults(@Param('type') type: string, @Query('limit') limit?: number) {
     const nLimit = limit ? Number(limit) : 10;
     let lottoType: LotteryType = LotteryType.LAO;
     if (type.toUpperCase() === 'THAI') lottoType = LotteryType.THAI;

     return (this.lotteryService as any).prisma.lotteryResult.findMany({
         where: { type: lottoType },
         orderBy: { drawDate: 'desc' },
         take: nLimit
     });
  }
}
