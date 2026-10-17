// Read functions for self-learn (server only).
import { and, count, desc, eq, gte, inArray } from 'drizzle-orm';
import { getDb } from '@/core/db/client';
import { courses, learnerProfiles, lessons, type Course } from '@/core/db/schema';
import type { AudienceProfile } from './audience';

export const DAILY_COURSE_LIMIT = 5;

export type OwnCourse = Pick<Course, 'id' | 'slug' | 'title' | 'emoji' | 'color' | 'summary' | 'createdAt'> & {
  lessonCount: number;
};

/** Courses this learner generated for themselves, newest first. */
export async function listOwnCourses(userId: string): Promise<OwnCourse[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      emoji: courses.emoji,
      color: courses.color,
      summary: courses.summary,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .where(and(eq(courses.ownerId, userId), eq(courses.source, 'learner_ai')))
    .orderBy(desc(courses.createdAt));
  if (rows.length === 0) return [];
  const counts = await db
    .select({ courseId: lessons.courseId, n: count() })
    .from(lessons)
    .where(
      inArray(
        lessons.courseId,
        rows.map((r) => r.id),
      ),
    )
    .groupBy(lessons.courseId);
  const byId = new Map(counts.map((c) => [c.courseId, c.n]));
  return rows.map((r) => ({ ...r, lessonCount: byId.get(r.id) ?? 0 }));
}

export async function countCoursesGeneratedToday(userId: string): Promise<number> {
  const db = await getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({ n: count() })
    .from(courses)
    .where(and(eq(courses.ownerId, userId), eq(courses.source, 'learner_ai'), gte(courses.createdAt, since)));
  return row?.n ?? 0;
}

export async function getAudienceProfile(userId: string): Promise<AudienceProfile | null> {
  const db = await getDb();
  const [row] = await db
    .select({
      background: learnerProfiles.background,
      codingLevel: learnerProfiles.codingLevel,
      track: learnerProfiles.track,
    })
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, userId))
    .limit(1);
  return row ?? null;
}
