import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Scraper module: Fetch the Space Invaders news page and cache it
 */

const CACHE_DIR = resolve('data');
const CACHE_FILE = resolve(CACHE_DIR, 'news-cache.html');

export async function scrapeNews(): Promise<string> {
  console.log('Fetching Space Invaders news page...');
  
  try {
    const response = await fetch('https://www.invader-spotter.art/news.php', {
      // Bypass HTTP caching to always get fresh content
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✓ Fetched ${html.length} bytes`);
    
    return html;
  } catch (error) {
    console.error('✗ Error fetching news page:', error);
    throw error;
  }
}

export function getCachedNews(): string | null {
  if (!existsSync(CACHE_FILE)) {
    console.log('No cached news file found');
    return null;
  }
  
  try {
    const cached = readFileSync(CACHE_FILE, 'utf-8');
    console.log(`✓ Loaded cached news (${cached.length} bytes)`);
    return cached;
  } catch (error) {
    console.error('✗ Error reading cache:', error);
    return null;
  }
}

export function cacheNews(html: string): void {
  try {
    // Ensure data directory exists
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    writeFileSync(CACHE_FILE, html, 'utf-8');
    console.log(`✓ Cached news to ${CACHE_FILE}`);
  } catch (error) {
    console.error('✗ Error caching news:', error);
    throw error;
  }
}
