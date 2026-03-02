import * as fs from 'fs';
const cheerio = require('cheerio');

const html = fs.readFileSync('thai-lotto.html', 'utf-8');
const $ = cheerio.load(html);

console.log($('div.lotto-highlight').text().replace(/\s+/g, ' ').substring(0, 500));

// Or look specifically for the elements with IDs like 'lotto-highlight-result'
const h = $('#lotto-highlight-result').text() || $('.lotto-result').text() || $('#lotto-check__box').text() || $('div:contains("รางวัลที่ 1")').last().parent().html();
console.log('Result HTML:', h?.substring(0, 500));
