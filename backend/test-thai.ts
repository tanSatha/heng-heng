import * as fs from 'fs';
const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const { data } = await axios.get('https://news.sanook.com/lotto/');
    fs.writeFileSync('thai-lotto.html', data);
    console.log('Saved thai-lotto.html');
    
    const $ = cheerio.load(data);
    
    // We need to find the latest draw results.
    // Let's print out the text of some elements to find where the results are.
    console.log($('h2').text());
    
    // Look for elements that might contain the results.
    // Like ID 'lotto-highlight-result' or class 'lotto-result'
    // Actually we can just wait to read the file or inspect it via node interactively.

  } catch (e) {
    console.error(e);
  }
}
test();
