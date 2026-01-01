# Changelog - SI RSS Generator Updates

## 2026-01-01

### RSS Feed Improvements

✅ **Reversed feed order**: Latest events now appear first (December → oldest)
- Previously: Oldest to newest (January → December)
- Now: Newest to oldest (most recent entries first)
- Better for RSS readers that show top entries first

✅ **Enhanced attribution**: Added source information to feed
- Feed description now credits invader-spotter.art
- Copyright notice includes both source and generator
- Author information links to source website

### Markdown & HTML Improvements

✅ **Reversed content order**: Most recent entries appear first
- Previous structure: 2025 January → December (oldest first)
- New structure: 2025 December → January (newest first)
- Same applies to months and days within each month

✅ **Human-readable date format**: Improved date display
- Previous: `#### 02` (day number only, unclear)
- New: `- **Saturday, September 27, 2025**` (full weekday, month, day, year)
- Dates are now immediately recognizable and human-friendly

✅ **Restructured Markdown format**: Days as list items
- Previous: Heading level 4 (h4) for day + list of events
  ```markdown
  #### 02
  - 🟢 **New**: PA_1234
  ```
- New: Day as bold list item with nested events
  ```markdown
  - **Saturday, September 27, 2025**
    - 🔴 **Destruction**: NY_165, RDU_04
  ```
- More logical hierarchy and cleaner visual structure

✅ **Added Space Invader links**: Clickable IDs
- Previous: `PA_1234` (plain text)
- New: `[PA_1234](https://www.invader-spotter.art/?p=PA_1234)` (clickable link)
- Links directly to invader-spotter.art profile for each invader
- Users can click to see full details and history

✅ **Source attribution in HTML**: Prominent acknowledgment
- Added info box with link to invader-spotter.art
- Appears at top of page with distinct styling
- Both in markdown and rendered HTML

## Technical Changes

### Modified Files

**src/rss-generator.ts**
- Reversed items array before processing: `const reversedItems = [...items].reverse()`
- Enhanced feed description with source attribution
- Updated copyright notice

**src/markdown-generator.ts**
- Reversed month iteration: `.sort().reverse().map(Number)` for newest first
- Reversed day sorting within months: `byYear[year][month].sort((a, b) => b.day - a.day)`
- Improved date formatting using `toLocaleDateString()` with options
- Changed day structure from h4 heading to bold list item
- Added Space Invader links using markdown syntax
- Added source attribution below title
- Enhanced HTML attribution box with styling and link

### Functions Updated

- `generateMarkdown()`: Full rewrite of structure and formatting
- RSS feed metadata: Enhanced descriptions and copyright

## Impact

### For Users

1. **RSS Subscribers**: See latest events immediately when checking feeds
2. **Website Visitors**: 
   - Easier to find recent news (reverse chronological order)
   - Clickable Space Invader links for quick reference
   - Clear attribution to source
   - Better date context (weekday name is helpful)

### For the Project

- Better UX alignment with common content publishing patterns
- Proper source attribution maintains community respect
- Cleaner markdown structure easier to read and maintain
- More discoverable content via clickable links

## Files Modified

- `src/rss-generator.ts` - 3 changes
- `src/markdown-generator.ts` - 8+ changes
- Generated files updated:
  - `docs/feed.xml` - Now reverse chronological
  - `docs/NEWS.md` - Now reverse chronological with new format
  - `docs/index.html` - Includes attribution box

## Verification

✅ All changes tested successfully:
- RSS feed generates without errors
- Markdown generates with new structure
- HTML renders correctly with CSS styling
- Space Invader links are properly formatted
- Attribution appears in all outputs
- 1068 day entries parsed and organized
- Latest 90 days in RSS feed (41 entries)

## Notes

- Reverse order applies only to RSS and markdown output
- Original HTML cache maintains chronological order internally
- Change detection still works reliably
- No breaking changes to core functionality
- All features remain production-ready
