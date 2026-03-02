import * as fs from 'fs';
const cheerio = require('cheerio');

const html = fs.readFileSync('thai-lotto-past.html', 'utf-8');
const $ = cheerio.load(html);

// Find elements with "รางวัลที่ 1"
$('strong').each((i: any, el: any) => {
    const text = $(el).text();
    if(text.includes('รางวัลที่ 1')) {
        console.log('found "รางวัลที่ 1"');
        console.log('\nParent:', $(el).parent().html());
        console.log('\nNext:', $(el).parent().next().html());
    }
});

// Or how about we look at all elements with class starting with "lotto"
$('[class^="lotto"], [class*=" lotto"]').slice(0, 10).each((i: any, el: any) => {
    console.log('Lotto class:', $(el).attr('class'), $(el).text().trim().replace(/\s+/g, ' ').substring(0, 50));
});

