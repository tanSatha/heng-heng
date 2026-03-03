import { Controller, Post, Get, Body, UseGuards, Request, Req, Query, UploadedFile, UseInterceptors, Param } from '@nestjs/common';
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
    
    // Parse limit, default to 20 if not provided
    const limitParams = parseInt(limitArgs || '20');

    try {
      // Use Overpass API (OpenStreetMap) for reliable nearby search
      // TAT API requires provinceName which we don't have from simple lat/lng without reverse geocoding
      
      const tatApiKey = this.configService.get<string>('TAT_API_KEY') || ''; // User needs to set this in .env
      
      // Try TAT API First if Key exists
      if (tatApiKey) {
         try {
            const { data } = await firstValueFrom(
              this.httpService.get(
                `https://tatapi.tourismthailand.org/tatapi/v5/places/search`, 
                {
                  headers: { 
                    'Authorization': `Bearer ${tatApiKey}`,
                    'Accept-Language': 'th' 
                  },
                  params: {
                    keyword: keyword || 'วัด',
                    latitude: lat,
                    longitude: lng,
                    limit: limitParams || 20
                  },
                  timeout: 4000
                }
              )
            );
            
            if (data && data.result) {
               return data.result.map((item: any) => ({
                 name: item.place_name,
                 vicinity: item.location?.province || item.destination || 'ใกล้ฉัน',
                 distance: item.distance ? `${item.distance} m` : 'ใกล้เคียง'
               }));
            }
         } catch (tatError) {
            console.error('TAT API Fail, falling back to Overpass:', tatError.message);
         }
      }

      // 2. Use Overpass API (OpenStreetMap) - Free & No Key required
      // Searches for temples (amenity=place_of_worship) within 5km
      // Multiple servers for reliability (Render IP can be rate-limited)
      const overpassServers = [
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass-api.de/api/interpreter',
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
      ];

      const radius = keyword ? 10000 : 5000;
      const cleanKeyword = keyword ? keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
      const tag = keyword 
         ? `["name"~"${cleanKeyword}",i]`
         : `["amenity"="place_of_worship"]`;

      const query = `
         [out:json][timeout:10];
         (
           nwr${tag}(around:${radius},${lat},${lng});
         );
         out center 30;
      `;

      for (const server of overpassServers) {
        try {
          const { data } = await firstValueFrom(
             this.httpService.get(
                `${server}?data=${encodeURIComponent(query)}`,
                { timeout: 12000 }
             )
          );

          if (data && data.elements && data.elements.length > 0) {
             return data.elements.map((el: any) => {
                const pLat = el.lat || el.center?.lat;
                const pLon = el.lon || el.center?.lon;
                if (!pLat || !pLon) return null;

                const R = 6371; 
                const dLat = (pLat - Number(lat)) * Math.PI / 180;
                const dLon = (pLon - Number(lng)) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                          Math.cos(Number(lat) * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) * 
                          Math.sin(dLon/2) * Math.sin(dLon/2); 
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                const dist = R * c;

                return {
                   name: el.tags?.name || 'สถานที่ศักดิ์สิทธิ์ (ไม่ระบุชื่อ)',
                   vicinity: el.tags?.['addr:city'] || 'ใกล้ฉัน',
                   distanceVal: dist,
                   distance: dist < 1 ?(`${(dist*1000).toFixed(0)} ม.`) : (`${dist.toFixed(1)} กม.`)
                };
             })
             .filter((item: any) => item && item.name !== 'สถานที่ศักดิ์สิทธิ์ (ไม่ระบุชื่อ)')
             .sort((a: any, b: any) => a.distanceVal - b.distanceVal)
             .slice(0, limitParams || 30);
          }
        } catch (overpassError) {
            console.error(`Overpass server ${server} failed:`, overpassError.message);
            continue; // Try next server
        }
      }

      // 3. Fallback: No Data
      return [];

    } catch (error) {
      console.error('API Error', error.message);
      // Final Fallback
      return [
        { name: 'วัดพระแก้ว (จำลอง)', vicinity: 'กรุงเทพมหานคร', distance: '5.2 กม.' },
        { name: 'วัดอรุณ', vicinity: 'บางกอกใหญ่', distance: '6.1 กม.' }
      ];
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
