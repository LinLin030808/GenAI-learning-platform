// Pure ranking rules for the leaderboard (unit tested in ranking.test.ts).

export interface RankInput {
  userId: string;
  xp: number;
  /** XP in the previous period, used for the ▲▼ movement arrows */
  prevXp?: number;
}

export interface Ranked<T extends RankInput = RankInput> {
  userId: string;
  xp: number;
  rank: number;
  prevRank: number | null;
  /** prevRank - rank: positive = climbed, null = no previous data */
  movement: number | null;
  /** XP needed to overtake the next rank up, null for rank 1 */
  gapToNext: number | null;
  entry: T;
}

/** Standard competition ranking ("1, 2, 2, 4"), ties broken by userId for stable order. */
function competitionRanks<T>(items: T[], score: (t: T) => number, id: (t: T) => string): Map<string, number> {
  const sorted = [...items].sort((a, b) => score(b) - score(a) || id(a).localeCompare(id(b)));
  const ranks = new Map<string, number>();
  let lastScore: number | null = null;
  let lastRank = 0;
  sorted.forEach((item, i) => {
    const s = score(item);
    const r = s === lastScore ? lastRank : i + 1;
    ranks.set(id(item), r);
    lastScore = s;
    lastRank = r;
  });
  return ranks;
}

export function rankEntries<T extends RankInput>(entries: T[]): (Ranked<T> & Omit<T, keyof Ranked<T>>)[] {
  const ranks = competitionRanks(entries, (e) => e.xp, (e) => e.userId);
  const hasPrev = entries.some((e) => (e.prevXp ?? 0) > 0);
  const prevRanks = hasPrev
    ? competitionRanks(entries, (e) => e.prevXp ?? 0, (e) => e.userId)
    : new Map<string, number>();

  const sorted = [...entries].sort(
    (a, b) => ranks.get(a.userId)! - ranks.get(b.userId)! || a.userId.localeCompare(b.userId),
  );
  // XP of the best entry with a strictly better rank, per rank
  const firstXpAtRank = new Map<number, number>();
  for (const e of sorted) {
    const r = ranks.get(e.userId)!;
    if (!firstXpAtRank.has(r)) firstXpAtRank.set(r, e.xp);
  }
  const distinctRanks = [...firstXpAtRank.keys()].sort((a, b) => a - b);

  return sorted.map((e) => {
    const rank = ranks.get(e.userId)!;
    const idx = distinctRanks.indexOf(rank);
    const aboveRank = idx > 0 ? distinctRanks[idx - 1]! : null;
    const prevRank = hasPrev ? (prevRanks.get(e.userId) ?? null) : null;
    return {
      ...e,
      rank,
      prevRank,
      movement: prevRank === null ? null : prevRank - rank,
      gapToNext: aboveRank === null ? null : firstXpAtRank.get(aboveRank)! - e.xp + 1,
      entry: e,
    };
  });
}

export interface ChaseInfo<T> {
  me: T;
  ahead: T | null;
  xpToPass: number | null;
  activitiesToPass: number | null;
  behind: T | null;
  lead: number | null;
}

/** "You are 31 XP behind Ben (about 2 activities). Chloe is 20 XP behind you." */
export function chaseInfo<T extends { userId: string; rank: number; xp: number; gapToNext: number | null }>(
  board: T[],
  userId: string,
  typicalActivityXp: number,
): ChaseInfo<T> | null {
  const me = board.find((e) => e.userId === userId);
  if (!me) return null;
  const ahead = [...board].reverse().find((e) => e.rank < me.rank) ?? null;
  const behind = board.find((e) => e.rank > me.rank) ?? null;
  const xpToPass = ahead ? me.gapToNext : null;
  return {
    me,
    ahead,
    xpToPass,
    activitiesToPass: xpToPass ? Math.max(1, Math.ceil(xpToPass / typicalActivityXp)) : null,
    behind,
    lead: behind ? me.xp - behind.xp : null,
  };
}

export function pickHighlights<T extends { userId: string; movement: number | null; streak: number; activities: number }>(
  entries: T[],
) {
  const best = (score: (e: T) => number) => {
    let top: T | null = null;
    for (const e of entries) if (score(e) > 0 && (!top || score(e) > score(top))) top = e;
    return top;
  };
  return {
    climber: best((e) => e.movement ?? 0),
    streak: best((e) => e.streak),
    busiest: best((e) => e.activities),
  };
}
