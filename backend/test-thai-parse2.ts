import * as fs from 'fs';
const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const { data } = await axios.get('https://news.sanook.com/lotto/check/16022569/');
    fs.writeFileSync('thai-lotto-past.html', data);
    const $ = cheerio.load(data);
    
    const p1 = $('#print-lotto2 > strong').text().trim() || $('strong:contains("รางวัลที่ 1")').parent().next().text().trim();
    console.log('p1:', p1);

    const bolds = $('div.js-box-lotto-main strong, section#check-lotto strong');
    bolds.each((i: any, el: any) => {
        console.log('bold:', $(el).text().trim());
    });

  } catch (e) {
    console.error(e);
  }
}
test();
