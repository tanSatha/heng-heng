import * as fs from 'fs';
const cheerio = require('cheerio');

const html = fs.readFileSync('thai-lotto.html', 'utf-8');
const $ = cheerio.load(html);

console.log('first lotto num:', $('.lotto__number--first').text().trim() || 'NOT FOUND');
console.log('any lotto num:', $('.lotto__number').first().text().trim() || 'NOT FOUND');
