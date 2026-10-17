// Built-in activity types. Isomorphic: imported by client players (via the registry) and
// by server code (AI generation, validation). Server-only code lives in */server.ts and
// */actions.ts and is never imported from here.
import type { ActivityDefinition } from '@/core/activity-types';
import { codingActivity } from './coding/definition';
import { quizActivity } from './quiz/definition';
import { roleplayActivity } from './roleplay/definition';
import { sequenceActivity } from './sequence/definition';
import { slidesActivity } from './slides/definition';
import { sortActivity } from './sort/definition';

export const coreActivityTypes: ActivityDefinition[] = [
  quizActivity,
  sortActivity,
  sequenceActivity,
  slidesActivity,
  codingActivity,
  roleplayActivity,
];
