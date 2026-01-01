#!/usr/bin/env bun

/**
 * SI RSS Generator - Main Orchestration Script
 * Runs hourly via GitHub Actions
 * 
 * Flow:
 * 1. Fetch page HTML
 * 2. Parse news items
 * 3. Generate RSS and Markdown
 * 4. Detect changes
 * 5. Commit if changed
 */

import { config } from 'dotenv';
import { scrapeNews, getCachedNews, cacheNews } from './scraper.js';
import { parseNews, filterLastNDays } from './parser.js';
import { hasChanged } from './change-detector.js';
import { generateRss, saveRss } from './rss-generator.js';
import { generateMarkdown, saveMarkdown, generateHtml, saveHtml } from './markdown-generator.js';
import { configureGit, commitAndPush } from './git-handler.js';

// Load environment variables
config();

const SITE_URL = process.env.SITE_URL || 'https://jfix.github.io/si-rss-generator';
const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';

async function main() {
  console.log('=== SI RSS Generator ===');
  console.log(`Started at ${new Date().toISOString()}`);
  console.log(`GitHub Actions: ${IS_GITHUB_ACTIONS}\n`);
  
  try {
    // Step 1: Fetch fresh news
    console.log('Step 1: Fetching news...');
    const freshHtml = await scrapeNews();
    
    // Step 2: Check for changes
    console.log('\nStep 2: Detecting changes...');
    const cachedHtml = getCachedNews();
    const changed = hasChanged(freshHtml, cachedHtml);
    
    if (!changed && cachedHtml !== null) {
      console.log('\n✓ No changes detected. Exiting.');
      process.exit(0);
    }
    
    // Step 3: Parse news
    console.log('\nStep 3: Parsing news...');
    const parsed = parseNews(freshHtml);
    
    // Filter to last 90 days for RSS
    const lastNinetyDays = filterLastNDays(parsed.items, 90);
    console.log(`Filtered to ${lastNinetyDays.length} entries in last 90 days`);
    
    // Step 4: Generate RSS
    console.log('\nStep 4: Generating RSS...');
    const rssContent = generateRss(lastNinetyDays, SITE_URL);
    saveRss(rssContent);
    
    // Step 5: Generate Markdown
    console.log('\nStep 5: Generating Markdown...');
    const markdownContent = generateMarkdown(parsed.items);
    saveMarkdown(markdownContent);
    
    // Step 6: Generate HTML from Markdown
    console.log('\nStep 6: Generating HTML...');
    const htmlContent = generateHtml(markdownContent);
    saveHtml(htmlContent);
    
    // Step 7: Cache the HTML
    console.log('\nStep 7: Caching HTML...');
    cacheNews(freshHtml);
    
    // Step 8: Commit changes (if running in GitHub Actions)
    if (IS_GITHUB_ACTIONS) {
      console.log('\nStep 8: Committing changes...');
      try {
        configureGit();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const message = `Update Space Invaders news - ${dateStr}`;
        
        commitAndPush(
          ['data/news-cache.html', 'docs/feed.xml', 'docs/NEWS.md', 'docs/index.html'],
          message
        );
      } catch (error) {
        console.error('Warning: Failed to commit changes:', error);
        // Don't exit with error - the data files are still generated
      }
    } else {
      console.log('\nStep 8: Skipping git operations (not running in GitHub Actions)');
    }
    
    console.log('\n✓ All done!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  }
}

main();
