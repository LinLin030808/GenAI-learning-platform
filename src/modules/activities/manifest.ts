import type { ModuleManifest } from '@/core/types';

// Activity types are registered in src/registry/activities.ts (they are not pages),
// so this manifest only describes the module.
export const activitiesManifest: ModuleManifest = {
  id: 'activities',
  name: 'Interactive activities',
  description: 'Quiz, sorting game, sequencing, in-browser coding, narrated slides and AI role-play.',
};
