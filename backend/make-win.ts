import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const resultLao = await prisma.lotteryResult.findFirst({
    where: { type: 'LAO' },
    orderBy: { drawDate: 'desc' },
  });

  const resultThai = await prisma.lotteryResult.findFirst({
    where: { type: 'THAI' },
    orderBy: { drawDate: 'desc' },
  });

  console.log('Latest LAO Result:', resultLao);
  console.log('Latest THAI Result:', resultThai);

  // Take the first user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found');
    return;
  }
  
  const temple = await prisma.temple.findFirst() || await prisma.temple.create({ data: { name: 'วัดห้วยปลากั้ง' } });

  if (resultLao) {
    const data: any = resultLao.resultData;
    const numToWin = data.number4 || data.number3 || data.number2;
    if (numToWin) {
      await prisma.lotteryRecord.create({
        data: {
          userId: user.id,
          type: 'LAO',
          numbers: numToWin,
          drawDate: resultLao.drawDate,
          templeId: temple.id,
          templeName: temple.name,
        } as any
      });
      console.log('Created winning LAO record for user:', numToWin);
    }
  }

  if (resultThai) {
    const data: any = resultThai.resultData;
    const numToWin = data.bottom2 || data.number1;
    if (numToWin) {
      await prisma.lotteryRecord.create({
        data: {
          userId: user.id,
          type: 'THAI',
          numbers: numToWin,
          drawDate: resultThai.drawDate,
          templeId: temple.id,
          templeName: temple.name,
        } as any
      });
      console.log('Created winning THAI record for user:', numToWin);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
