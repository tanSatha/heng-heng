import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LotteryType } from '@prisma/client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LotteryService {
  constructor(private prisma: PrismaService) {}

  async createLottery(
    userPayload: { userId: string; email: string },
    data: {
      numbers: string;
      temple_name: string;
      type: LotteryType;
      draw_date: string; // ISO String
      photo_url?: string; // Optional
      photo_url_2?: string; // Optional
    },
  ) {
    console.log('DEBUG createLottery:', data);
    // 1. Sync User
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { providerId: userPayload.userId }, // Google ID or similar
          { email: userPayload.email }        // Fallback to Email (Unique)
        ]
      },
    });

    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            providerId: userPayload.userId,
            email: userPayload.email,
          },
        });
      } catch (e) {
        // Double check concurrency race condition
        user = await this.prisma.user.findUnique({ where: { email: userPayload.email }});
      }
    }

    if (!user) {
      throw new Error('Could not find or create user');
    }

    // 2. Find or Create Temple (upsert to handle race condition when submitting multiple types simultaneously)
    const temple = await this.prisma.temple.upsert({
      where: { name: data.temple_name },
      update: {},
      create: { name: data.temple_name },
    });

    // 3. Create Lottery Record
    let dbType: LotteryType = LotteryType.THAI;
    if (String(data.type) === 'huay_thai' || String(data.type) === 'THAI') dbType = LotteryType.THAI;
    else if (String(data.type) === 'huay_lao' || String(data.type) === 'LAO') dbType = LotteryType.LAO;

    const targetDate = new Date(data.draw_date);
    
    // Validate: same user + same temple + same draw period is not allowed
    const existing = await this.prisma.lotteryRecord.findFirst({
       where: {
          userId: user.id,
          type: dbType,
          drawDate: targetDate,
          templeName: data.temple_name
       }
    });

    if (existing) {
       throw new Error('คุณได้บันทึกวัดนี้ในงวดนี้ไปแล้ว ไม่สามารถบันทึกวัดเดิมซ้ำในงวดเดียวกันได้');
    }

    return this.prisma.lotteryRecord.create({
      data: {
        numbers: data.numbers,
        type: dbType,
        drawDate: targetDate,
        userId: user.id, // Internal UUID
        templeId: temple.id,
        templeName: data.temple_name,
        photoUrl: data.photo_url,
        photoUrl2: data.photo_url_2,
      } as any,
    });
  }

  async getUserStats(userPayload: { userId: string; email?: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { providerId: userPayload.userId },
          { email: userPayload.email }
        ],
      },
    });

    if (!user) return [];

    return this.prisma.lotteryRecord.findMany({
      where: { userId: user.id },
      include: { temple: true },
      orderBy: { drawDate: 'desc' },
    });
  }
  async getRecentRecords(userPayload: { userId: string; email?: string }, limit: number = 5) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ providerId: userPayload.userId }, { email: userPayload.email }],
      },
    });

    if (!user) return [];

    return this.prisma.lotteryRecord.findMany({
      where: { userId: user.id },
      include: { temple: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
  async getLotteryById(id: number, userPayload: { userId: string; email?: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ providerId: userPayload.userId }, { email: userPayload.email }],
      },
    });

    if (!user) throw new Error('User not found');

    const record = await this.prisma.lotteryRecord.findUnique({
      where: { id: Number(id) },
      include: { temple: true },
    });

    if (!record || record.userId !== user.id) {
      throw new Error('Record not found or unauthorized');
    }

    return record;
  }

  async deleteRecord(id: number, userPayload: { userId: string; email?: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ providerId: userPayload.userId }, { email: userPayload.email }],
      },
    });

    if (!user) throw new Error('User not found');

    const record = await this.prisma.lotteryRecord.findUnique({ where: { id } });
    if (!record || record.userId !== user.id) {
      throw new Error('Record not found or unauthorized');
    }

    await this.prisma.lotteryRecord.delete({ where: { id } });
    return { success: true };
  }

  async getUserWins(userPayload: { userId: string; email?: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ providerId: userPayload.userId }, { email: userPayload.email }],
      },
    });

    if (!user) return [];

    const records = await this.prisma.lotteryRecord.findMany({
      where: { userId: user.id },
      orderBy: { drawDate: 'desc' },
      take: 50,
      include: { temple: true },
    });

    const wins: any[] = [];

    for (const record of records) {
      try {
        const result = await this.prisma.lotteryResult.findFirst({
          where: { type: record.type, drawDate: record.drawDate },
        });

        if (!result) continue;

        const numbersBought = record.numbers ? record.numbers.split(',').map(n => n.trim()).filter(n => n.length > 0) : [];
        const resData: any = result.resultData || {};
        const winningNumbers: string[] = [];

      if (record.type === LotteryType.THAI) {
        const { number1, front3, back3, bottom2 } = resData;
        for (const num of numbersBought) {
          if (num.length === 6 && num === number1) winningNumbers.push(num);
          if (num.length === 3) {
            if (front3 && front3.includes(num)) winningNumbers.push(num);
            if (back3 && back3.includes(num)) winningNumbers.push(num);
            if (number1 && number1.endsWith(num)) winningNumbers.push(num);
          }
          if (num.length === 2) {
            if (num === bottom2) winningNumbers.push(num);
            if (number1 && number1.endsWith(num)) winningNumbers.push(num);
          }
        }
      }

      if (record.type === LotteryType.LAO) {
        const { number4, number3 } = resData;
        for (const num of numbersBought) {
          if (num.length === 4 && num === number4) winningNumbers.push(num);
          if (num.length === 3 && num === number3) winningNumbers.push(num);
          if (num.length === 2) {
            if (number4 && number4.substring(0, 2) === num) winningNumbers.push(num);
            if (number4 && number4.substring(2, 4) === num) winningNumbers.push(num);
          }
        }
      }

      if (winningNumbers.length > 0) {
        wins.push({
          ...record,
          wonNumbers: [...new Set(winningNumbers)],
          resultData: resData,
        });
      }
      } catch (e) {
         console.error(`Error processing record ${record.id}:`, e);
      }
    }

    return wins;
  }

  async makeMockWin() {
    const resultLao = await this.prisma.lotteryResult.findFirst({
      where: { type: 'LAO' },
      orderBy: { drawDate: 'desc' },
    });
    const resultThai = await this.prisma.lotteryResult.findFirst({
      where: { type: 'THAI' },
      orderBy: { drawDate: 'desc' },
    });

    const user = await this.prisma.user.findFirst();
    if (!user) return { success: false, message: 'No user to give wins to' };

    let temple = await this.prisma.temple.findFirst();
    if (!temple) temple = await this.prisma.temple.create({ data: { name: 'วัดห้วยปลากั้ง' } });

    const created: any[] = [];
    if (resultLao) {
      const data: any = resultLao.resultData;
      const numToWin = data.number3 || data.number2;
      if (numToWin) {
         const exists = await this.prisma.lotteryRecord.findFirst({ where: { userId: user.id, drawDate: resultLao.drawDate, type: 'LAO', numbers: numToWin } });
         if (!exists) {
            await this.prisma.lotteryRecord.create({
               data: {
                  userId: user.id, type: 'LAO', numbers: numToWin, drawDate: resultLao.drawDate, templeId: temple.id, templeName: temple.name
               } as any
            });
         }
         created.push({ type: 'LAO', num: numToWin });
      }
    }
    if (resultThai) {
      const data: any = resultThai.resultData;
      const numToWin = data.bottom2;
      if (numToWin) {
         const exists = await this.prisma.lotteryRecord.findFirst({ where: { userId: user.id, drawDate: resultThai.drawDate, type: 'THAI', numbers: numToWin } });
         if (!exists) {
            await this.prisma.lotteryRecord.create({
               data: {
                  userId: user.id, type: 'THAI', numbers: numToWin, drawDate: resultThai.drawDate, templeId: temple.id, templeName: temple.name
               } as any
            });
         }
         created.push({ type: 'THAI', num: numToWin });
      }
    }
    return { success: true, created };
  }

  async scrapeLaoLottery() {
    const axios = require('axios');
    const cheerio = require('cheerio');
    
    const { data } = await axios.get('https://www.sanook.com/news/laolotto/');
    const $ = cheerio.load(data);
    const results: any[] = [];

    $('div.LaoLottoArchiveTable').each((i: any, el: any) => {
      const titleText = $(el).find('h2').text().trim();
      
      const monthMap: Record<string, string> = {
        'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 
        'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
        'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
      };

      let drawDate: Date | null = null;
      const dateMatch = titleText.match(/(\d{1,2})\s([^ ]+)\s(\d{4})/);
      if(dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          // Fix spacing issue in Thai month names if any
          let foundMonth: string | null = null;
          for (const key of Object.keys(monthMap)) {
             if (dateMatch[2].includes(key)) foundMonth = monthMap[key];
          }
          if (!foundMonth) return;
          
          const year = parseInt(dateMatch[3]) - 543;
          drawDate = new Date(`${year}-${foundMonth}-${day}T00:00:00.000Z`);
      }

      const number4 = $(el).find('.LastNum .type').filter((idx: any, e: any) => $(e).find('span').text().includes('4 ตัว')).contents().last().text().trim();
      const number3 = $(el).find('.LastNum .type').filter((idx: any, e: any) => $(e).find('span').text().includes('3 ตัว')).contents().last().text().trim();
      const number2 = $(el).find('.LastNum .type').filter((idx: any, e: any) => $(e).find('span').text().includes('2 ตัว')).contents().last().text().trim();

      if (drawDate && number4) {
        results.push({
          type: LotteryType.LAO,
          drawDate,
          resultData: { number4, number3, number2 }
        });
      }
    });

    let count = 0;
    for (const item of results) {
       await this.prisma.lotteryResult.upsert({
          where: {
            type_drawDate: {
               type: item.type,
               drawDate: item.drawDate
            }
          },
          update: {
            resultData: item.resultData
          },
          create: {
            type: item.type,
            drawDate: item.drawDate,
            resultData: item.resultData
          }
       });
       count++;
    }
    return { success: true, count };
  }

  // Schedule to run exactly at 20:33 on Monday (1), Wednesday (3), and Friday (5)
  @Cron('0 33 20 * * 1,3,5')
  async handleCronLaoLotteryScrape() {
    console.log(`[${new Date().toISOString()}] Cron trigger: Scraping Lao Lottery Results...`);
    try {
      const res = await this.scrapeLaoLottery();
      console.log(`[${new Date().toISOString()}] Cron scrape finished successfully. Synced ${res.count} records.`);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] Cron scrape failed:`, e);
    }
  }

  async scrapeThaiLottery() {
    const axios = require('axios');
    const cheerio = require('cheerio');
    
    const { data } = await axios.get('https://news.sanook.com/lotto/');
    const $ = cheerio.load(data);
    
    const titleText = $('.lotto-check__title').first().text().trim();
    if (!titleText) return { success: false, message: 'Title not found' };

    const monthMap: Record<string, string> = {
      'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 
      'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
      'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    };

    let drawDate: Date | null = null;
    const dateMatch = titleText.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
    if(dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        let foundMonth: string | null = null;
        for (const key of Object.keys(monthMap)) {
            if (dateMatch[2].includes(key)) foundMonth = monthMap[key];
        }
        if (foundMonth) {
           const year = parseInt(dateMatch[3]) - 543;
           // Assuming timezone to be +07:00 or GMT, storing as ISO 00:00 UTC
           drawDate = new Date(`${year}-${foundMonth}-${day}T00:00:00.000Z`);
        }
    }

    if (!drawDate) return { success: false, message: 'Invalid Date' };

    const nums = $('.lotto__number').slice(0, 6);
    if (nums.length < 6) return { success: false, message: 'Numbers not found' };

    const number1 = $(nums[0]).text().trim();
    const front3 = [$(nums[1]).text().trim(), $(nums[2]).text().trim()];
    const back3 = [$(nums[3]).text().trim(), $(nums[4]).text().trim()];
    const bottom2 = $(nums[5]).text().trim();

    const resultData = { number1, front3, back3, bottom2 };

    await this.prisma.lotteryResult.upsert({
      where: {
        type_drawDate: {
           type: LotteryType.THAI,
           drawDate: drawDate
        }
      },
      update: {
        resultData: resultData
      },
      create: {
        type: LotteryType.THAI,
        drawDate: drawDate,
        resultData: resultData
      }
    });

    return { success: true, drawDate, resultData };
  }

  // Schedule to run exactly at 16:00 on the 1st and 16th of every month
  @Cron('0 0 16 1,16 * *')
  async handleCronThaiLotteryScrape() {
    console.log(`[${new Date().toISOString()}] Cron trigger: Scraping Thai Lottery Results...`);
    try {
      const res = await this.scrapeThaiLottery();
      console.log(`[${new Date().toISOString()}] Cron scrape finished successfully (Thai).`, res);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] Cron scrape failed (Thai):`, e);
    }
  }
}
