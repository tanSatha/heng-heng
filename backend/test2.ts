import axios from 'axios';
import * as cheerio from 'cheerio';

async function run() {
  const { data } = await axios.get('https://www.sanook.com/news/laolotto/');
  const $ = cheerio.load(data);
  let firstItemHtml = '';
  $('h2').each((i, el) => {
      const h2Text = $(el).text().trim();
      if(h2Text.includes('ตรวจหวยลาว งวดประจำวัน')) {
         if (!firstItemHtml) firstItemHtml = $.html($(el).parent());
      }
  });
  console.log(firstItemHtml);
}
run();
