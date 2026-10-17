// Pure XP / level / streak rules. No database access, so they are easy to unit test and
// every module (leaderboard, home, shell) computes them the same way.

export interface LevelInfo {
  level: number;
  name: string;
  /** XP needed to reach this level */
  minXp: number;
  /** XP needed for the next level, null at max level */
  nextXp: number | null;
  /** 0-1 progress towards next level */
  progress: number;
}

// The mascot grows with the learner: seed → sprout → sapling → tree → forest.
export const LEVELS = [
  { name: 'Seed', minXp: 0 },
  { name: 'Sprout', minXp: 100 },
  { name: 'Seedling', minXp: 250 },
  { name: 'Sapling', minXp: 500 },
  { name: 'Young Tree', minXp: 900 },
  { name: 'Tree', minXp: 1400 },
  { name: 'Grove', minXp: 2100 },
  { name: 'Forest', minXp: 3000 },
] as const;

export function getLevel(totalXp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalXp >= LEVELS[i]!.minXp) index = i;
  }
  const current = LEVELS[index]!;
  const next = LEVELS[index + 1];
  const progress = next ? (totalXp - current.minXp) / (next.minXp - current.minXp) : 1;
  return {
    level: index + 1,
    name: current.name,
    minXp: current.minXp,
    nextXp: next?.minXp ?? null,
    progress: Math.max(0, Math.min(1, progress)),
  };
}

/** Mascot growth stage 0-4 derived from level, used by <Pip stage={...} /> */
export function growthStage(level: number): 0 | 1 | 2 | 3 | 4 {
  if (level <= 1) return 0;
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  return 4;
}

/** Score 0-100 → XP. Passing (>=60) earns full base, partial below; perfect gets a bonus. */
export function xpForScore(score: number, xpReward: number): number {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s >= 100) return Math.round(xpReward * 1.2);
  if (s >= 60) return xpReward;
  return Math.round(xpReward * (s / 100));
}

/**
 * XP to award for a new attempt given what the learner already earned on this activity.
 * Only improvements count, so retrying cannot farm XP.
 */
export function xpDelta(previousXp: number, newScore: number, xpReward: number): number {
  return Math.max(0, xpForScore(newScore, xpReward) - previousXp);
}

export const LESSON_COMPLETE_XP = 10;
export const COURSE_COMPLETE_XP = 50;

/** YYYY-MM-DD in UTC. Streak days are counted in UTC for simplicity. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Consecutive active days ending today (or yesterday, so a streak survives until the
 * learner has had a chance to study today).
 */
export function computeStreak(activeDays: Iterable<string>, today = new Date()): number {
  const days = new Set(activeDays);
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
