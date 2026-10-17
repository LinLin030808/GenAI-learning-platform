// Pure helpers that turn a learner's onboarding profile into plain words for the course generator.
import type { LearnerBackground, LearnerProfile } from '@/core/db/schema';

const BACKGROUND: Record<LearnerBackground, string> = {
  non_cs: 'a non-CS university student',
  cs_student: 'a computer science student',
  cs_graduate: 'a computer science graduate',
  other: 'a university student',
};

const CODING = [
  'who has never coded',
  'who has tried a little coding',
  'who can write simple programs',
  'who codes regularly',
];

export type AudienceProfile = Pick<LearnerProfile, 'background' | 'codingLevel' | 'track'>;

/** e.g. "a non-CS university student who has never coded; likes concepts and everyday examples first" */
export function buildAudienceNote(profile: AudienceProfile | null, why?: string): string | undefined {
  const parts: string[] = [];
  if (profile) {
    const who = BACKGROUND[profile.background] ?? BACKGROUND.other;
    const coding = CODING[Math.min(Math.max(profile.codingLevel, 0), CODING.length - 1)];
    parts.push(`${who} ${coding}`);
    parts.push(
      profile.track === 'builder'
        ? 'likes hands-on practice first'
        : 'likes concepts and everyday examples first',
    );
  }
  if (why) parts.push(`wants to learn this because: ${why}`);
  return parts.length ? parts.join('; ') : undefined;
}

/** Honour "in 5 lessons" style topics; otherwise a short default. Always 1-6. */
export function lessonCountFromTopic(topic: string, fallback = 4): number {
  const m = topic.match(/\b([1-6])\s+(?:short\s+)?(?:lessons?|parts?|steps?)\b/i);
  return m ? Number(m[1]) : fallback;
}

/** Activity types self-learn courses prefer, limited to what is installed. Falls back to all. */
export function pickLearnerTypes(installed: string[], preferred = ['quiz', 'sort', 'sequence', 'slides']): string[] {
  const hits = preferred.filter((t) => installed.includes(t));
  return hits.length ? hits : installed;
}
