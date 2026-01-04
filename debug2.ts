import { readFileSync } from 'fs';
import { load } from 'cheerio';

const html = readFileSync('data/news-cache.html', 'utf-8');
const $ = load(html);
const div2026 = $('#mois202601');

const pElements = div2026.find('p');
pElements.each((_: any, element: any) => {
  const text = $(element).text().trim();
  console.log('P element text:', text.substring(0, 200));
  
  const dayMatch = text.match(/^(\d{1,2})\s*:\s*(.+)$/);
  console.log('Day match:', dayMatch ? `Day ${dayMatch[1]}: ${dayMatch[2].substring(0, 100)}` : 'NO MATCH');
  console.log('---');
});
