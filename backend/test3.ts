import axios from 'axios';
import * as cheerio from 'cheerio';

async function run() {
  const { data } = await axios.get('https://www.sanook.com/news/laolotto/');
  const $ = cheerio.load(data);
  const results: any[] = [];

  $('div.LaoLottoArchiveTable').each((i, el) => {
    const titleText = $(el).find('h2').text().trim(); // e.g., ตรวจหวยลาว งวดประจำวันที่ 23 กุมภาพันธ์ 2569
    
    // Convert Thai Date to normal Date (e.g. "23 กุมภาพันธ์ 2569" to Date object)
    const monthMap: Record<string, string> = {
      'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 
      'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
      'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    };

    let drawDate: Date | null = null;
    const dateMatch = titleText.match(/(\d{1,2})\s([^ ]+)\s(\d{4})/);
    if(dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const month = monthMap[dateMatch[2]];
        const year = parseInt(dateMatch[3]) - 543; // Convert Buddhist Era to CE
        drawDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    }

    const number4 = $(el).find('.LastNum .type').filter((i, e) => $(e).find('span').text().includes('4 ตัว')).contents().last().text().trim();
    const number3 = $(el).find('.LastNum .type').filter((i, e) => $(e).find('span').text().includes('3 ตัว')).contents().last().text().trim();
    const number2 = $(el).find('.LastNum .type').filter((i, e) => $(e).find('span').text().includes('2 ตัว')).contents().last().text().trim();

    results.push({
        titleText,
        drawDate,
        number4,
        number3,
        number2
    });
  });

  console.log(results);
}
run();
