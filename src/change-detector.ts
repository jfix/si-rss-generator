/**
 * Change detector: Compare HTML versions to detect if content has changed
 * Extracts and compares only the news content area to ignore dynamic elements
 */

import { createHash } from 'crypto';

export function hasChanged(newHtml: string, oldHtml: string | null): boolean {
  if (oldHtml === null) {
    console.log('No previous cache found - treating as changed');
    return true;
  }
  
  const newHash = hash(newHtml);
  const oldHash = hash(oldHtml);
  
  const changed = newHash !== oldHash;
  
  if (changed) {
    console.log(`✓ Content changed (hash: ${oldHash} → ${newHash})`);
  } else {
    console.log('✓ No changes detected (same hash)');
  }
  
  return changed;
}

/**
 * Extract the main news content from the page
 * Focuses on the news sections, ignoring headers, footers, and dynamic elements
 */
function extractNewsContent(html: string): string {
  // Try to extract content between specific markers if they exist
  // Otherwise, remove common dynamic elements and compare
  
  // Remove script tags and their content (can contain timestamps)
  let content = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // Remove style tags
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Remove common timestamp/dynamic attributes
  content = content.replace(/data-timestamp=["'][^"']*["']/gi, '');
  content = content.replace(/\?v=\d+/gi, ''); // Cache-busting query params
  content = content.replace(/nonce=["'][^"']*["']/gi, ''); // Nonce attributes
  
  // Keep only the body content (remove head section)
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }
  
  return content;
}

/**
 * Normalize HTML by removing extra whitespace and comments
 * This prevents false positives from formatting-only changes
 */
function normalizeHtml(content: string): string {
  return content
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove extra whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace from lines
    .replace(/^\s+|\s+$/gm, '')
    // Remove empty lines
    .replace(/\n\n+/g, '\n')
    .trim();
}

/**
 * Hash function using Node's crypto module for reliability
 * First extracts news content, then normalizes and hashes it
 */
function hash(content: string): string {
  const extracted = extractNewsContent(content);
  const normalized = normalizeHtml(extracted);
  return createHash('sha256').update(normalized).digest('hex');
}
