import { readFileSync } from 'fs';
import { load } from 'cheerio';

const html = readFileSync('data/news-cache.html', 'utf-8');
const $ = load(html);
const div2026 = $('#mois202601');

console.log('Found 2026-01 div:', div2026.length > 0);
if (div2026.length > 0) {
  const pElements = div2026.find('p');
  console.log('Number of <p> elements:', pElements.length);
  const divHtml = div2026.html();
  if (divHtml) {
    console.log('Div HTML (first 1000 chars):\n', divHtml.substring(0, 1000));
  }
}
