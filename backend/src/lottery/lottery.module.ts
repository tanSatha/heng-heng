import { Module } from '@nestjs/common';
import { LotteryController } from './lottery.controller';
import { LotteryService } from './lottery.service';
import { PrismaService } from '../prisma.service'; // Assuming path
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [LotteryController],
  providers: [LotteryService, PrismaService],
})
export class LotteryModule {}
