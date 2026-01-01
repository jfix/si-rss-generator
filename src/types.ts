/**
 * Core type definitions for SI RSS Generator
 */

export type UpdateType = 'destruction' | 'damage' | 'new' | 'reactivated' | 'status_change' | 'unknown';

export interface SpaceInvaderEvent {
  id: string;
  type: UpdateType;
  emoji: string; // 🔴 🟡 🟢 ⚪
}

export interface DayNews {
  year: number;
  month: number;
  day: number;
  date: string; // YYYY-MM-DD format
  events: SpaceInvaderEvent[];
  rawContent: string; // Original French text
}

export interface ParsedNews {
  items: DayNews[];
  fetchedAt: Date;
}

export interface RSSConfig {
  title: string;
  description: string;
  language: string;
  link: string;
  ttl: number; // Time to live in minutes (60 for 1 hour)
}

export interface MarkdownConfig {
  title: string;
  description: string;
}
