// Server helpers shared by activity actions/route handlers. Never import from client code.
import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { getDb } from '@/core/db/client';
import { activities, lessons } from '@/core/db/schema';

/** Loads an activity row and validates its config. Config always comes from the DB, never the client. */
export async function loadActivity<C>(activityId: string, schema: z.ZodType<C>) {
  const db = await getDb();
  const [row] = await db
    .select({ id: activities.id, type: activities.type, title: activities.title, config: activities.config, lessonTitle: lessons.title })
    .from(activities)
    .innerJoin(lessons, eq(lessons.id, activities.lessonId))
    .where(eq(activities.id, activityId))
    .limit(1);
  if (!row) return null;
  const parsed = schema.safeParse(row.config);
  if (!parsed.success) return null;
  return { ...row, config: parsed.data };
}
