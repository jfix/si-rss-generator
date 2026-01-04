import { readFileSync } from 'fs';
import { load } from 'cheerio';

const html = readFileSync('data/news-cache.html', 'utf-8');
const $ = load(html);
const div2026 = $('#mois202601');

const pElements = div2026.find('p');
pElements.each((_: any, element: any) => {
  const text = $(element).text().trim();
  // Remove all newlines and extra whitespace
  const clean = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  console.log('Original text (first 50):', JSON.stringify(text.substring(0, 50)));
  console.log('Cleaned text (first 50):', JSON.stringify(clean.substring(0, 50)));
  
  const dayMatch = clean.match(/^(\d{1,2})\s*:\s*(.+)$/);
  console.log('Match after cleaning:', dayMatch ? `Day ${dayMatch[1]}` : 'NO MATCH');
  console.log('---');
});
