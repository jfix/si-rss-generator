# SI RSS Generator

Convert [Space Invaders news](https://www.invader-spotter.art/news.php) to RSS and Markdown with automatic GitHub Pages publishing.

## Overview

This project automatically:
1. **Scrapes** the Space Invaders news page hourly (via GitHub Actions)
2. **Parses** monthly news sections and daily entries
3. **Generates** an RSS feed (one entry per day, last 90 days)
4. **Generates** a Markdown file organized by year/month/day
5. **Renders** Markdown as HTML for GitHub Pages
6. **Detects changes** by comparing cached HTML
7. **Auto-commits** and publishes when content changes

## Features

- 📡 **RSS Feed**: One RSS entry per day with all events grouped
- 📝 **Markdown**: Full historical record organized by year/month/day
- 🎨 **Emoji Indicators**:
  - 🔴 Red: Destruction
  - 🟡 Yellow: Damage/Degradation
  - 🟢 Green: New/Reactivated
  - ⚪ White: Status Change
- 🕐 **1-Hour Refresh**: RSS ttl set to 60 minutes
- 📱 **Responsive HTML**: Beautiful GitHub Pages site with sidebar navigation
- 🔄 **Automatic Updates**: Runs hourly, commits only when changes detected
- 🇫🇷 **French Support**: Parses French keywords and stores original content
- 🌐 **GitHub Pages**: Published automatically to `github.io`

## Project Structure

```
src/
  ├── types.ts              # TypeScript interfaces
  ├── scraper.ts            # Fetch & cache HTML
  ├── parser.ts             # Parse news from HTML
  ├── change-detector.ts    # Detect HTML changes
  ├── rss-generator.ts      # Generate RSS feed
  ├── markdown-generator.ts # Generate Markdown & HTML
  ├── git-handler.ts        # Git operations
  └── index.ts              # Main orchestration

data/
  └── news-cache.html       # Cached HTML for change detection

docs/
  ├── feed.xml              # Generated RSS feed
  ├── NEWS.md               # Generated Markdown
  ├── index.html            # Rendered HTML

.github/workflows/
  └── generate.yml          # Hourly GitHub Action

SPEC.md                      # Project specification
```

## Setup

### Prerequisites
- Bun runtime
- Node.js 18+ (for dev tools)
- Git repository with GitHub Pages enabled

### Installation

1. Clone and navigate to the repository:
```bash
git clone https://github.com/jfix/si-rss-generator.git
cd si-rss-generator
```

2. Install dependencies:
```bash
bun install
```

3. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` → `docs/`

### Local Usage

Generate feeds and pages:
```bash
bun run generate
```

Watch mode for development:
```bash
bun run dev
```

## How It Works

### Scraping
The scraper fetches `https://www.invader-spotter.art/news.php` and caches the HTML locally. This cached version is used for change detection, avoiding false positives from minor HTML modifications.

### Parsing
The parser extracts news from HTML structure:
- Finds `<div id="moisYYYYMM">` (monthly sections)
- Extracts `<p>` elements (daily entries)
- Parses day number and content
- Identifies Space Invader IDs (e.g., `PA_1234`)
- Detects event types from French keywords

### Change Detection
Compares the newly fetched HTML with the cached version using a hash function. If unchanged, the script exits without generating/committing files.

### Generation
- **RSS**: Creates one `<item>` per day, groups events by type, includes emoji indicators
- **Markdown**: Hierarchical structure (Year → Month → Day) with sidebar navigation
- **HTML**: Rendered from Markdown with responsive CSS and dynamic table of contents

### Publishing
GitHub Actions automatically:
1. Runs the generation script hourly
2. Detects changes by comparing `data/` and `docs/` folders
3. Commits and pushes if changes detected
4. Deploys `docs/` folder to GitHub Pages

## Environment Variables

Optional (defaults provided):
- `SITE_URL`: Base URL for RSS and links (default: `https://jfix.github.io/si-rss-generator`)
- `GITHUB_ACTIONS`: Auto-detected by GitHub Actions

## Output Examples

### RSS Feed
```xml
<item>
  <title>Monday, January 01, 2026</title>
  <link>https://jfix.github.io/si-rss-generator/#2026-01-01</link>
  <description>
    <ul>
      <li>🔴 <strong>destruction</strong>: PA_1234, PA_5678</li>
      <li>🟡 <strong>damage</strong>: NY_999</li>
      <li>🟢 <strong>new</strong>: LA_111</li>
    </ul>
  </description>
  <pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate>
</item>
```

### Markdown
```markdown
## 2026

### January

#### 01

- 🔴 **destruction**: PA_1234, PA_5678
- 🟡 **damage**: NY_999
- 🟢 **new**: LA_111
```

## GitHub Actions Workflow

The workflow (`generate.yml`) runs:

1. **Hourly** at minute 0 (cron: `0 * * * *`)
2. **On-demand** via manual workflow trigger
3. Checks out code, installs dependencies, runs generation
4. Commits changes (if any) to `main` branch
5. Deploys `docs/` folder to GitHub Pages

**Permissions**: 
- `contents: write` - Commit changes
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - GitHub Pages authentication

## RSS Feed Details

- **Title**: Space Invaders News
- **Description**: Latest updates on Space Invaders creations, destructions, and damage
- **TTL**: 60 minutes (1 hour refresh)
- **Language**: English
- **Link**: Anchors to GitHub Pages HTML page
- **Historical Scope**: Last 90 days

## Markdown Organization

The generated `NEWS.md` is organized as:

```
# Space Invaders News

## Table of Contents
- [2026](#2026)
  - [January](#2026-01)
  - [February](#2026-02)
- [2025](#2025)
  ...

---

## 2026
### January
#### 01
- Events...
#### 02
- Events...

### February
...
```

The sidebar navigation dynamically builds from headers and allows easy jumping between years, months, and days.

## Troubleshooting

### GitHub Actions not committing
- Verify repository Settings → Actions → General → "Read and write permissions"
- Check workflow logs for git configuration errors

### Pages not deploying
- Enable GitHub Pages in Settings → Pages
- Verify source is set to `main` → `docs/`
- Check Actions tab for deployment logs

### No changes detected after first run
- This is expected if the page HTML hasn't changed
- News will regenerate when the source page updates

## Technologies

- **Runtime**: Bun
- **Language**: TypeScript
- **HTML Parsing**: Cheerio
- **RSS Generation**: feed
- **Markdown Parsing**: marked
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit pull requests.

## Data Source

All data is sourced from [invader-spotter.art](https://www.invader-spotter.art/news.php), a community project tracking Space Invaders worldwide.
