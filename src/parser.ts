import { load } from 'cheerio';
import { DayNews, UpdateType, SpaceInvaderEvent, ParsedNews } from './types.js';

/**
 * Parser module: Extract news items from HTML
 * Parses monthly sections (moisYYYYMM) and daily entries
 */

// French action words to update types
const actionMap: Record<string, UpdateType> = {
  'destruction': 'destruction',
  'dégradation': 'damage',
  'ajout': 'new',
  'réactivation': 'reactivated',
  'changement': 'status_change',
  'changement de statut': 'status_change',
};

// Color to emoji mapping
const emojiMap: Record<UpdateType, string> = {
  'destruction': '🔴',
  'damage': '🟡',
  'new': '🟢',
  'reactivated': '🟢',
  'status_change': '⚪',
  'unknown': '⚪',
};

export function parseNews(html: string): ParsedNews {
  console.log('Parsing news HTML...');
  
  const $ = load(html);
  const items: DayNews[] = [];
  
  // Find all month divs (format: moisYYYYMM)
  const monthDivs = $('div[id^="mois"]').toArray();
  console.log(`Found ${monthDivs.length} month sections`);
  
  for (const monthDiv of monthDivs) {
    const id = $(monthDiv).attr('id');
    if (!id) continue;
    
    // Parse month/year from div id (format: moisYYYYMM)
    const match = id.match(/mois(\d{4})(\d{2})/);
    if (!match) continue;
    
    const [, yearStr, monthStr] = match;
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    
    console.log(`  Processing ${yearStr}-${monthStr}`);
    
    // Parse all <p> elements in this month (each is a day's entry)
    $(monthDiv).find('p').each((_: any, element: any) => {
      const text = $(element).text().trim();
      if (!text) return;
      
      // Extract day from start of text (format: "DD: content" or "D: content")
      const dayMatch = text.match(/^(\d{1,2})\s*:\s*(.+)$/);
      if (!dayMatch) return;
      
      const [, dayStr, content] = dayMatch;
      const day = parseInt(dayStr);
      
      const dayNews = parseDayContent(year, month, day, content);
      if (dayNews.events.length > 0) {
        items.push(dayNews);
      }
    });
  }
  
  // Sort by date (oldest first)
  items.sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1, a.day).getTime();
    const dateB = new Date(b.year, b.month - 1, b.day).getTime();
    return dateA - dateB;
  });
  
  console.log(`✓ Parsed ${items.length} day entries`);
  
  return {
    items,
    fetchedAt: new Date(),
  };
}

function parseDayContent(year: number, month: number, day: number, content: string): DayNews {
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const events: SpaceInvaderEvent[] = [];
  
  // Extract all Space Invader IDs (format: XX_NNNN where XX is 2+ letters, NNNN is digits)
  const invaderRegex = /([A-Z]{2,}_\d+)/g;
  const matches = content.match(invaderRegex) || [];
  
  // Determine event type based on French keywords in content
  const lowerContent = content.toLowerCase();
  let eventType: UpdateType = 'unknown';
  
  for (const [keyword, type] of Object.entries(actionMap)) {
    if (lowerContent.includes(keyword)) {
      eventType = type;
      break;
    }
  }
  
  // Create an event for each unique Space Invader ID
  const uniqueIds = [...new Set(matches)];
  for (const id of uniqueIds) {
    events.push({
      id,
      type: eventType,
      emoji: emojiMap[eventType],
    });
  }
  
  return {
    year,
    month,
    day,
    date,
    events,
    rawContent: content,
  };
}

/**
 * Filter news items to last N days
 */
export function filterLastNDays(items: DayNews[], days: number): DayNews[] {
  if (items.length === 0) return [];
  
  const lastItem = items[items.length - 1];
  const lastDate = new Date(lastItem.year, lastItem.month - 1, lastItem.day);
  const cutoffDate = new Date(lastDate);
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return items.filter(item => {
    const itemDate = new Date(item.year, item.month - 1, item.day);
    return itemDate >= cutoffDate;
  });
}
