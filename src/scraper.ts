import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Scraper module: Fetch the Space Invaders news page and cache it
 */

const CACHE_DIR = resolve('data');
const CACHE_FILE = resolve(CACHE_DIR, 'news-cache.html');

const NEWS_URL = 'https://www.invader-spotter.art/news.php';
const FETCH_TIMEOUT_MS = 30_000;
// Delay before each retry; length = number of retries after the first attempt.
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000];

async function fetchOnce(): Promise<string> {
  const response = await fetch(NEWS_URL, {
    // Bypass HTTP caching to always get fresh content
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: HTTP ${response.status} ${response.statusText}`.trim());
  }

  return response.text();
}

export async function scrapeNews(): Promise<string> {
  console.log('Fetching Space Invaders news page...');

  for (let attempt = 0; ; attempt++) {
    try {
      const html = await fetchOnce();
      console.log(`✓ Fetched ${html.length} bytes`);
      return html;
    } catch (error) {
      if (attempt >= RETRY_DELAYS_MS.length) {
        console.error('✗ Error fetching news page:', error);
        throw error;
      }
      const delay = RETRY_DELAYS_MS[attempt];
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`⚠ Fetch attempt ${attempt + 1} failed (${reason}); retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
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
