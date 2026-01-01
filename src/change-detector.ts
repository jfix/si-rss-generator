/**
 * Change detector: Compare HTML versions to detect if content has changed
 */

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
 * Simple hash function for content comparison
 * Using a basic approach - for production, consider crypto.createHash
 */
function hash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
