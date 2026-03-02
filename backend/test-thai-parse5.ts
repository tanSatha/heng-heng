import * as fs from 'fs';
const cheerio = require('cheerio');

const html = fs.readFileSync('thai-lotto.html', 'utf-8');
const $ = cheerio.load(html);

const nums = $('.lotto__number');
console.log('Got', nums.length, 'numbers');
nums.each((i: any, el: any) => {
    console.log(`[${i}]`, $(el).text().trim());
});

console.log('Header text:', $('.lotto-check__title').first().text().trim() || $('h2').first().text().trim());
