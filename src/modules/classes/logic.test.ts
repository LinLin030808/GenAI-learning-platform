import { describe, expect, it } from 'vitest';
import { fillDaySeries, formatLastActive, mean,nameFromEmail, nudgeReason, parseStudentCsv, MAX_IMPORT_ROWS } from './logic';

describe('parseStudentCsv', () => {
  it('reads rows with a header', () => {
    const { rows, skipped } = parseStudentCsv('name,email\nMia Wong,Mia@Uni.edu\nLeo Chan,leo@uni.edu');
    expect(rows).toMatchObject([
      { name: 'Mia Wong', email: 'mia@uni.edu' },
      { name: 'Leo Chan', email: 'leo@uni.edu' },
    ]);
    expect(skipped).toEqual([]);
  });

  it('works without a header and with swapped columns', () => {
    const { rows } = parseStudentCsv('leo@uni.edu,Leo Chan\nMia Wong,mia@uni.edu');
    expect(rows).toMatchObject([
      { name: 'Leo Chan', email: 'leo@uni.edu' },
      { name: 'Mia Wong', email: 'mia@uni.edu' },
    ]);
  });

  it('detects column order from the header', () => {
    const { rows } = parseStudentCsv('Email Address,Full Name\nann@uni.edu,Ann Lee');
    expect(rows).toMatchObject([{ name: 'Ann Lee', email: 'ann@uni.edu' }]);
  });

  it('skips bad emails, duplicates and blank lines', () => {
    const { rows, skipped } = parseStudentCsv(
      'name,email\nMia,mia@uni.edu\n\nBob,not-an-email\nMia again,MIA@uni.edu\nNo Email,',
    );
    expect(rows).toHaveLength(1);
    expect(skipped.map((s) => s.reason)).toEqual([
      'That email does not look right',
      'Same email appears earlier in the list',
      'No email on this row',
    ]);
  });

  it('derives a name when only an email is given', () => {
    const { rows } = parseStudentCsv('kai.tanaka@uni.edu');
    expect(rows).toMatchObject([{ name: 'Kai Tanaka', email: 'kai.tanaka@uni.edu' }]);
  });

  it('handles quoted names with commas and a BOM', () => {
    const { rows } = parseStudentCsv('﻿name,email\n"Wong, Mia",mia@uni.edu\r\n');
    expect(rows).toMatchObject([{ name: 'Wong, Mia', email: 'mia@uni.edu' }]);
  });

  it('caps the number of rows', () => {
    const lines = Array.from({ length: MAX_IMPORT_ROWS + 3 }, (_, i) => `S${i},s${i}@uni.edu`);
    const { rows, skipped } = parseStudentCsv(lines.join('\n'));
    expect(rows).toHaveLength(MAX_IMPORT_ROWS);
    expect(skipped).toHaveLength(3);
  });
});

describe('nameFromEmail', () => {
  it('title-cases the local part', () => {
    expect(nameFromEmail('sam_lee-2@x.io')).toBe('Sam Lee 2');
  });
});

describe('nudgeReason', () => {
  const now = new Date('2026-10-17T12:00:00Z');
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  it('flags students who never started', () => {
    expect(nudgeReason({ lastActiveAt: null, progress: 0, classAverage: 40, now })).toBe('no_activity');
  });

  it('flags 5+ quiet days', () => {
    expect(nudgeReason({ lastActiveAt: daysAgo(5), progress: 80, classAverage: 40, now })).toBe('inactive');
    expect(nudgeReason({ lastActiveAt: daysAgo(4), progress: 80, classAverage: 40, now })).toBeNull();
  });

  it('flags progress far below the class average', () => {
    expect(nudgeReason({ lastActiveAt: daysAgo(1), progress: 10, classAverage: 60, now })).toBe('behind');
    expect(nudgeReason({ lastActiveAt: daysAgo(1), progress: 45, classAverage: 60, now })).toBeNull();
  });

  it('does not flag "behind" when the whole class is just starting', () => {
    expect(nudgeReason({ lastActiveAt: daysAgo(1), progress: 0, classAverage: 10, now })).toBeNull();
  });
});

describe('formatLastActive', () => {
  const now = new Date('2026-10-17T12:00:00Z');
  it('uses friendly words for recent days', () => {
    expect(formatLastActive(null, now)).toBe('Never');
    expect(formatLastActive(new Date('2026-10-17T09:00:00Z'), now)).toBe('Today');
    expect(formatLastActive(new Date('2026-10-16T09:00:00Z'), now)).toBe('Yesterday');
    expect(formatLastActive(new Date('2026-10-10T12:00:00Z'), now)).toBe('7 days ago');
  });
});

describe('mean', () => {
  it('returns null for an empty list', () => {
    expect(mean([])).toBeNull();
    expect(mean([10, 20])).toBe(15);
  });
});

describe('fillDaySeries', () => {
  it('fills missing days with zeros, oldest first', () => {
    const now = new Date('2026-10-17T08:00:00Z');
    const series = fillDaySeries([{ day: '2026-10-16', events: 3, xp: 40 }], 3, now);
    expect(series.map((p) => p.day)).toEqual(['2026-10-15', '2026-10-16', '2026-10-17']);
    expect(series[1]).toMatchObject({ events: 3, xp: 40, label: '16 Oct' });
    expect(series[2]).toMatchObject({ events: 0, xp: 0 });
  });
});
