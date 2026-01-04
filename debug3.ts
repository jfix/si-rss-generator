import { readFileSync } from 'fs';
import { load } from 'cheerio';

const html = readFileSync('data/news-cache.html', 'utf-8');
const $ = load(html);
const div2026 = $('#mois202601');

const pElements = div2026.find('p');
pElements.each((_: any, element: any) => {
  const text = $(element).text().trim();
  console.log('Text bytes:', Buffer.from(text.substring(0, 20)).toString('hex'));
  console.log('Text chars:', text.substring(0, 20).split('').map((c, i) => `${i}:'${c}'(${c.charCodeAt(0)})`).join(' '));
  
  // Try just matching anything after trimming
  const simplified = text.match(/^(\d{1,2})\s*:\s*(.+)$/);
  if (!simplified) {
    // Try with more flexible whitespace
    const flexible = text.match(/^(\d{1,2})\s*[:：]\s*(.+)$/);
    console.log('Flexible match:', flexible ? `Day ${flexible[1]}` : 'NO MATCH');
  }
  console.log('---');
});
