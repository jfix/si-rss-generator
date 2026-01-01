import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { marked } from 'marked';
import * as types from './types.js';

/**
 * Markdown Generator: Convert parsed news to Markdown with table of contents
 * Organized by year → month → day
 */

const DOCS_DIR = resolve('docs');
const MARKDOWN_FILE = resolve(DOCS_DIR, 'NEWS.md');
const HTML_FILE = resolve(DOCS_DIR, 'index.html');

export function generateMarkdown(items: types.DayNews[]): string {
  console.log('Generating Markdown...');
  
  if (items.length === 0) {
    return '# Space Invaders News\n\nNo entries found.\n';
  }
  
  // Group items by year, then month
  const byYear: Record<number, Record<number, types.DayNews[]>> = {};
  
  for (const item of items) {
    if (!byYear[item.year]) {
      byYear[item.year] = {};
    }
    if (!byYear[item.year][item.month]) {
      byYear[item.year][item.month] = [];
    }
    byYear[item.year][item.month].push(item);
  }
  
  // Build table of contents
  let markdown = '# Space Invaders News\n\n';
  markdown += '_Data sourced from [invader-spotter.art](https://www.invader-spotter.art) - a community project tracking Space Invaders worldwide._\n\n';
  markdown += '## Table of Contents\n\n';
  
  // Sort years in descending order (newest first)
  const yearsSorted = Object.keys(byYear).map(Number).sort((a, b) => b - a);
  
  for (const year of yearsSorted) {
    markdown += `- [${year}](#${year})\n`;
    // Sort months in descending order (December first)
    const monthsSorted = Object.keys(byYear[year]).map(Number).sort((a, b) => b - a);
    for (const month of monthsSorted) {
      const monthName = getMonthName(month);
      markdown += `  - [${monthName}](#${year}-${String(month).padStart(2, '0')})\n`;
    }
  }
  
  markdown += '\n---\n\n';
  
  // Build content - newest first (reverse chronological)
  for (const year of yearsSorted) {
    markdown += `## ${year}\n\n`;
    
    // Sort months in descending order (December to January)
    const monthsSorted = Object.keys(byYear[year]).map(Number).sort((a, b) => b - a);
    for (const month of monthsSorted) {
      const monthName = getMonthName(month);
      markdown += `### ${monthName}\n\n`;
      
      // Sort days in reverse (newest first)
      const sortedDays = byYear[year][month].sort((a, b) => b.day - a.day);
      
      for (const dayItem of sortedDays) {
        const monthName = getMonthName(dayItem.month);
        const dateStr = `${dayItem.day} ${monthName} ${dayItem.year}`;
        
        // Group events by type
        const eventsByType: Record<string, string[]> = {};
        for (const event of dayItem.events) {
          if (!eventsByType[event.type]) {
            eventsByType[event.type] = [];
          }
          eventsByType[event.type].push(event.id);
        }
        
        // Build events list inline
        const eventsList: string[] = [];
        for (const [type, ids] of Object.entries(eventsByType)) {
          const emoji = dayItem.events.find((e: any) => e.type === type)?.emoji || '⚪';
          const typeLabel = formatTypeLabel(type);
          const linkedIds = ids.map(id => `[${id}](https://www.invader-spotter.art/?p=${id})`).join(', ');
          eventsList.push(`${emoji} **${typeLabel}**: ${linkedIds}`);
        }
        
        // Single list item with all events inline
        markdown += `- **${dateStr}** — ${eventsList.join(' • ')}\n`;
      }
      
      markdown += '\n';
    }
  }
  
  console.log(`✓ Generated Markdown with ${items.length} day entries`);
  
  return markdown;
}

export function saveMarkdown(content: string): void {
  try {
    // Ensure docs directory exists
    if (!existsSync(DOCS_DIR)) {
      mkdirSync(DOCS_DIR, { recursive: true });
    }
    
    writeFileSync(MARKDOWN_FILE, content, 'utf-8');
    console.log(`✓ Saved Markdown to ${MARKDOWN_FILE}`);
  } catch (error) {
    console.error('✗ Error saving Markdown:', error);
    throw error;
  }
}

export function generateHtml(markdown: string): string {
  console.log('Generating HTML from Markdown...');
  
  const htmlContent = marked(markdown);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Space Invaders News</title>
  <link rel="alternate" type="application/rss+xml" title="Space Invaders News" href="/feed.xml">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .sidebar {
      position: sticky;
      top: 20px;
      float: right;
      width: 250px;
      background: #f9f9f9;
      padding: 20px;
      border-left: 2px solid #ddd;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      margin-left: 20px;
    }
    
    .sidebar h2 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 15px;
      letter-spacing: 1px;
    }
    
    .sidebar ul {
      list-style: none;
    }
    
    .sidebar li {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .sidebar a {
      color: #0066cc;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .sidebar a:hover {
      color: #0052a3;
      text-decoration: underline;
    }
    
    .sidebar li ul {
      margin-left: 15px;
      margin-top: 5px;
    }
    
    .sidebar li ul li {
      font-size: 13px;
    }
    
    .content {
      padding: 40px;
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      color: #222;
    }
    
    h2 {
      font-size: 1.8em;
      margin-top: 40px;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 2px solid #0066cc;
      padding-bottom: 10px;
    }
    
    h2:first-of-type {
      margin-top: 0;
    }
    
    h3 {
      font-size: 1.3em;
      margin-top: 25px;
      margin-bottom: 15px;
      color: #444;
    }
    
    h4 {
      font-size: 1.1em;
      margin-top: 15px;
      margin-bottom: 10px;
      color: #555;
    }
    
    hr {
      border: none;
      border-top: 2px solid #ddd;
      margin: 30px 0;
    }
    
    ul {
      list-style: none;
      padding: 0;
    }
    
    li {
      margin: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    
    li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #0066cc;
      font-weight: bold;
    }
    
    strong {
      color: #222;
      font-weight: 600;
    }
    
    em {
      color: #666;
      font-style: italic;
    }
    
    a {
      color: #0066cc;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .rss-link {
      display: inline-block;
      margin-bottom: 20px;
      padding: 10px 15px;
      background: #ff9800;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
    }
    
    .rss-link:hover {
      background: #e68900;
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        float: none;
        width: 100%;
        margin: 0;
        margin-top: 30px;
        border-left: none;
        border-top: 2px solid #ddd;
        padding-top: 30px;
      }
      
      .content {
        padding: 20px;
      }
      
      h1 {
        font-size: 1.8em;
      }
      
      h2 {
        font-size: 1.3em;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <a href="/feed.xml" class="rss-link">📡 Subscribe to RSS Feed</a>
      <p style="margin: 15px 0; padding: 10px; background: #f0f8ff; border-left: 3px solid #0066cc; font-style: italic; color: #555;">
        📍 Data sourced from <a href="https://www.invader-spotter.art" target="_blank" style="color: #0066cc;">invader-spotter.art</a> - a community project tracking Space Invaders worldwide.
      </p>
      ${htmlContent}
    </div>
    <div class="sidebar">
      <h2>Navigation</h2>
      <ul id="toc"></ul>
    </div>
  </div>
  
  <script>
    // Generate table of contents in sidebar from headers
    const toc = document.getElementById('toc');
    const headings = document.querySelectorAll('.content h2, .content h3');
    
    let currentLevel = null;
    let currentList = toc;
    
    headings.forEach(heading => {
      if (heading.textContent.trim() === 'Table of Contents') return;
      
      const level = parseInt(heading.tagName[1]);
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      li.appendChild(a);
      
      if (level === 2) {
        currentList = toc;
        currentList.appendChild(li);
      } else if (level === 3 && currentList === toc) {
        const ul = document.createElement('ul');
        ul.appendChild(li);
        currentList.lastChild.appendChild(ul);
        currentList = ul;
      }
    });
  </script>
</body>
</html>`;
  
  console.log('✓ Generated HTML from Markdown');
  
  return html;
}

export function saveHtml(content: string): void {
  try {
    // Ensure docs directory exists
    if (!existsSync(DOCS_DIR)) {
      mkdirSync(DOCS_DIR, { recursive: true });
    }
    
    writeFileSync(HTML_FILE, content, 'utf-8');
    console.log(`✓ Saved HTML to ${HTML_FILE}`);
  } catch (error) {
    console.error('✗ Error saving HTML:', error);
    throw error;
  }
}

function getMonthName(month: number): string {
  const names = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[month] || 'Unknown';
}

function formatTypeLabel(type: string): string {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
