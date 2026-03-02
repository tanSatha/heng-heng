import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const records = await prisma.lotteryRecord.findMany({
    take: 10
  });
  
  console.log('Total records:', records.length);
  
  if (records.length === 0) {
    console.log('No records found.');
    return;
  }

  const wins: any[] = [];
  
  for (const record of records) {
    console.log('Processing record:', record.id, 'numbers:', record.numbers);
    const result = await prisma.lotteryResult.findFirst({
      where: { type: record.type, drawDate: record.drawDate },
    });
    
    if (!result) {
       console.log('No result found for type:', record.type, 'date:', record.drawDate);
       continue;
    }
    
    const numbersBought = record.numbers.split(',').map(n => n.trim()).filter(n => n.length > 0);
    const resData: any = result.resultData;
    const winningNumbers: string[] = [];
    
    if (record.type === 'THAI') {
      const { number1, front3, back3, bottom2 } = resData;
      for (const num of numbersBought) {
        if (num.length === 6 && num === number1) winningNumbers.push(num);
        if (num.length === 3) {
          if (front3 && (front3 as string[]).includes(num)) winningNumbers.push(num);
          if (back3 && (back3 as string[]).includes(num)) winningNumbers.push(num);
          if (number1 && (number1 as string).endsWith(num)) winningNumbers.push(num);
        }
        if (num.length === 2) {
          if (num === bottom2) winningNumbers.push(num);
          if (number1 && (number1 as string).endsWith(num)) winningNumbers.push(num);
        }
      }
    }
    
    if (record.type === 'LAO') {
      const { number4, number3 } = resData;
      for (const num of numbersBought) {
        if (num.length === 4 && num === number4) winningNumbers.push(num);
        if (num.length === 3 && num === number3) winningNumbers.push(num);
        if (num.length === 2) {
          if (number4 && (number4 as string).substring(0, 2) === num) winningNumbers.push(num);
          if (number4 && (number4 as string).substring(2, 4) === num) winningNumbers.push(num);
        }
      }
    }
    
    if (winningNumbers.length > 0) {
      wins.push({
        ...record,
        wonNumbers: [...new Set(winningNumbers)],
      });
    }
  }
  
  console.log('Wins:', wins);
}

main().catch(console.error).finally(() => prisma.$disconnect());
