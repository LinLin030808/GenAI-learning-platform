// Pure helpers for the classes module: CSV import parsing, "needs a nudge" flags and chart
// series. No database access here so the rules are easy to unit test.
import Papa from 'papaparse';
import { z } from 'zod';

export const MAX_IMPORT_ROWS = 200;
export const INACTIVE_DAYS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const emailSchema = z.email();

export interface StudentRow {
  name: string;
  email: string;
  /** 1-based row number, for error messages */
  row: number;
}

export interface SkippedRow {
  /** 1-based row number in the pasted text / file */
  row: number;
  text: string;
  reason: string;
}

export interface ParsedStudentCsv {
  rows: StudentRow[];
  skipped: SkippedRow[];
}

function isEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/** "mia.wong@uni.edu" → "Mia Wong", used when a row only has an email. */
export function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return (
    local
      .split(/[._\-+]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || email
  );
}

/**
 * Parses `name,email` rows. The header row is optional and the column order is detected
 * from it; without a header we look for the cell that is an email. Duplicates and bad rows
 * are reported instead of thrown, so the instructor sees exactly what was skipped.
 */
export function parseStudentCsv(text: string): ParsedStudentCsv {
  const result = Papa.parse<string[]>(text.replace(/^﻿/, '').trim(), {
    skipEmptyLines: 'greedy',
  });
  const table = result.data.map((cells) => cells.map((c) => String(c ?? '').trim()));
  const rows: StudentRow[] = [];
  const skipped: SkippedRow[] = [];
  const seen = new Set<string>();

  let nameCol: number | null = null;
  let emailCol: number | null = null;
  let start = 0;
  const header = table[0]?.map((c) => c.toLowerCase());
  const headerEmailCol = header?.findIndex((c) => c.includes('email') || c.includes('e-mail')) ?? -1;
  if (header && headerEmailCol >= 0 && !header.some(isEmail)) {
    emailCol = headerEmailCol;
    const n = header.findIndex((c) => c.includes('name') || c === 'student');
    nameCol = n >= 0 ? n : null;
    start = 1;
  }

  for (let i = start; i < table.length; i++) {
    const cells = table[i] ?? [];
    const rowNumber = i + 1;
    const raw = cells.join(', ');
    if (rows.length >= MAX_IMPORT_ROWS) {
      skipped.push({ row: rowNumber, text: raw, reason: `Over the ${MAX_IMPORT_ROWS}-row limit` });
      continue;
    }

    let email: string;
    let name: string;
    if (emailCol !== null) {
      email = cells[emailCol] ?? '';
      name = nameCol !== null ? (cells[nameCol] ?? '') : '';
    } else {
      const found = cells.findIndex(isEmail);
      email = found >= 0 ? (cells[found] ?? '') : (cells[1] ?? cells[0] ?? '');
      name = cells.find((c, idx) => idx !== found && c.length > 0) ?? '';
    }

    email = email.toLowerCase();
    if (!email) {
      skipped.push({ row: rowNumber, text: raw, reason: 'No email on this row' });
      continue;
    }
    if (!isEmail(email)) {
      skipped.push({ row: rowNumber, text: raw, reason: 'That email does not look right' });
      continue;
    }
    if (seen.has(email)) {
      skipped.push({ row: rowNumber, text: raw, reason: 'Same email appears earlier in the list' });
      continue;
    }
    seen.add(email);
    rows.push({ email, name: (name || nameFromEmail(email)).slice(0, 60), row: rowNumber });
  }

  return { rows, skipped };
}

export function daysSince(date: Date | null, now: Date = new Date()): number | null {
  if (!date) return null;
  return Math.floor((now.getTime() - date.getTime()) / DAY_MS);
}

/** "Today", "Yesterday", "3 days ago", "Never". */
export function formatLastActive(date: Date | null, now: Date = new Date()): string {
  if (!date) return 'Never';
  const days = Math.floor((now.getTime() - date.getTime()) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export type NudgeReason ='no_activity' | 'inactive' | 'behind';

export const NUDGE_LABEL: Record<NudgeReason, string> = {
  no_activity: 'No activity yet',
  inactive: `Quiet for ${INACTIVE_DAYS}+ days`,
  behind: 'Behind the class',
};

/**
 * A student "needs a nudge" when they have been quiet for INACTIVE_DAYS or more, or their
 * progress is far below the class average (less than half of it and 20+ points behind).
 */
export function nudgeReason(input: {
  lastActiveAt: Date | null;
  progress: number | null;
  classAverage: number | null;
  now?: Date;
}): NudgeReason | null {
  const days = daysSince(input.lastActiveAt, input.now);
  if (days === null) return 'no_activity';
  if (days >= INACTIVE_DAYS) return 'inactive';
  if (input.progress !== null && input.classAverage !== null && input.classAverage >= 20) {
    if (input.progress < input.classAverage * 0.5 && input.classAverage - input.progress >= 20) {
      return 'behind';
    }
  }
  return null;
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface DayPoint {
  /** YYYY-MM-DD (UTC) */
  day: string;
  /** Short label for the chart axis, e.g. "17 Oct" */
  label: string;
  events: number;
  xp: number;
}

/** Turns sparse per-day rows into a continuous series for the last `days` UTC days. */
export function fillDaySeries(
  rows: { day: string; events: number; xp: number }[],
  days: number,
  now: Date = new Date(),
): DayPoint[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today - i * DAY_MS);
    const day = date.toISOString().slice(0, 10);
    const row = byDay.get(day);
    out.push({
      day,
      label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
      events: row?.events ?? 0,
      xp: row?.xp ?? 0,
    });
  }
  return out;
}
