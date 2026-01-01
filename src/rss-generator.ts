import { Feed } from 'feed';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { DayNews } from './types.js';

/**
 * RSS Generator: Convert parsed news to RSS 2.0 feed
 * Creates one RSS entry per day, groups all events for that day
 */

const DOCS_DIR = resolve('docs');
const RSS_FILE = resolve(DOCS_DIR, 'feed.xml');

export function generateRss(items: DayNews[], siteUrl: string = 'https://jfix.github.io/si-rss-generator'): string {
  console.log('Generating RSS feed...');
  
  const feed = new Feed({
    title: 'Space Invaders News',
    description: 'Latest updates on Space Invaders creations, destructions, and damage. Data sourced from invader-spotter.art - a community project tracking Space Invaders worldwide.',
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    image: 'https://www.invader-spotter.art/favicon.ico',
    favicon: 'https://www.invader-spotter.art/favicon.ico',
    copyright: 'Data from invader-spotter.art - SI RSS Generator',
    generator: 'SI RSS Generator',
    ttl: 120, // 1 hour in minutes
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  });
  
  // Reverse items to show latest first
  const reversedItems = [...items].reverse();
  
  // Group items by day and create RSS entries
  for (const item of reversedItems) {
    const itemDate = new Date(item.year, item.month - 1, item.day);
    const dateStr = itemDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Group events by type and build description
    const eventsByType: Record<string, string[]> = {};
    for (const event of item.events) {
      if (!eventsByType[event.type]) {
        eventsByType[event.type] = [];
      }
      eventsByType[event.type].push(event.id);
    }
    
    // Build HTML description with emojis and grouped events
    let description = '<ul>';
    for (const [type, ids] of Object.entries(eventsByType)) {
      const emoji = item.events.find((e: any) => e.type === type)?.emoji || '⚪';
      const typeLabel = type.replace(/_/g, ' ');
      description += `<li>${emoji} <strong>${typeLabel}</strong>: ${ids.join(', ')}</li>`;
    }
    description += '</ul>';
    
    // Also add original French content
    description += `<p><strong>Original:</strong> <em>${escapeHtml(item.rawContent)}</em></p>`;
    
    feed.addItem({
      title: `${dateStr}`,
      id: `${siteUrl}#${item.date}`,
      link: `${siteUrl}/#${item.date}`,
      description,
      date: itemDate,
      author: [
        {
          name: 'invader-spotter.art',
          link: 'https://www.invader-spotter.art'
        }
      ],
    });
  }
  
  const rssContent = feed.rss2();
  console.log(`✓ Generated RSS feed with ${items.length} entries`);
  
  return rssContent;
}

export function saveRss(content: string): void {
  try {
    // Ensure docs directory exists
    if (!existsSync(DOCS_DIR)) {
      mkdirSync(DOCS_DIR, { recursive: true });
    }
    
    writeFileSync(RSS_FILE, content, 'utf-8');
    console.log(`✓ Saved RSS feed to ${RSS_FILE}`);
  } catch (error) {
    console.error('✗ Error saving RSS:', error);
    throw error;
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
