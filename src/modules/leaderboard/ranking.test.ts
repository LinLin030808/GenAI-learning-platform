import { describe, expect, it } from 'vitest';
import { chaseInfo, pickHighlights, rankEntries } from './ranking';

describe('rankEntries', () => {
  it('ranks by xp with shared ranks for ties (1, 2, 2, 4)', () => {
    const ranked = rankEntries([
      { userId: 'a', xp: 50 },
      { userId: 'b', xp: 120 },
      { userId: 'c', xp: 50 },
      { userId: 'd', xp: 10 },
    ]);
    expect(ranked.map((r) => [r.userId, r.rank])).toEqual([
      ['b', 1],
      ['a', 2],
      ['c', 2],
      ['d', 4],
    ]);
  });

  it('computes movement against the previous period (positive = climbed)', () => {
    const ranked = rankEntries([
      { userId: 'a', xp: 100, prevXp: 10 },
      { userId: 'b', xp: 50, prevXp: 90 },
    ]);
    const a = ranked.find((r) => r.userId === 'a')!;
    const b = ranked.find((r) => r.userId === 'b')!;
    expect(a.movement).toBe(1);
    expect(b.movement).toBe(-1);
  });

  it('gives the xp needed to overtake the next person up', () => {
    const ranked = rankEntries([
      { userId: 'a', xp: 100 },
      { userId: 'b', xp: 70 },
      { userId: 'c', xp: 70 },
    ]);
    expect(ranked[0]!.gapToNext).toBeNull();
    expect(ranked[1]!.gapToNext).toBe(31);
    expect(ranked[2]!.gapToNext).toBe(31);
  });

  it('treats missing prevXp as zero and leaves movement null when nobody had xp before', () => {
    const ranked = rankEntries([{ userId: 'a', xp: 5 }]);
    expect(ranked[0]!.movement).toBeNull();
  });
});

describe('chaseInfo', () => {
  const board = rankEntries([
    { userId: 'a', xp: 200 },
    { userId: 'b', xp: 150 },
    { userId: 'me', xp: 120 },
    { userId: 'd', xp: 100 },
  ]);

  it('finds who is just ahead and just behind', () => {
    const info = chaseInfo(board, 'me', 20)!;
    expect(info.ahead?.userId).toBe('b');
    expect(info.xpToPass).toBe(31);
    expect(info.activitiesToPass).toBe(2);
    expect(info.behind?.userId).toBe('d');
    expect(info.lead).toBe(20);
  });

  it('returns null for someone not on the board', () => {
    expect(chaseInfo(board, 'ghost', 20)).toBeNull();
  });
});

describe('pickHighlights', () => {
  it('ignores zero values', () => {
    const h = pickHighlights([
      { userId: 'a', movement: 0, streak: 0, activities: 0 },
      { userId: 'b', movement: 3, streak: 5, activities: 9 },
    ]);
    expect(h.climber?.userId).toBe('b');
    expect(h.streak?.userId).toBe('b');
    expect(h.busiest?.userId).toBe('b');
  });
});
