// Server-only helpers for studio actions: load a course / lesson / activity the user may edit,
// keep positions contiguous, and refresh the cached course totals.
import { asc, eq } from 'drizzle-orm';
import { getCourseById, canEditCourse } from '@/core/content/queries';
import { getDb } from '@/core/db/client';
import { activities, courses, lessons, type Activity, type Course, type Lesson } from '@/core/db/schema';
import type { SessionUser } from '@/core/types';

export async function loadEditableCourse(user: SessionUser, courseId: string): Promise<Course | null> {
  const course = await getCourseById(courseId);
  if (!course || !(await canEditCourse(user, course))) return null;
  return course;
}

export async function loadEditableLesson(
  user: SessionUser,
  lessonId: string,
): Promise<{ lesson: Lesson; course: Course } | null> {
  const db = await getDb();
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lesson) return null;
  const course = await loadEditableCourse(user, lesson.courseId);
  return course ? { lesson, course } : null;
}

export async function loadEditableActivity(
  user: SessionUser,
  activityId: string,
): Promise<{ activity: Activity; lesson: Lesson; course: Course } | null> {
  const db = await getDb();
  const [activity] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!activity) return null;
  const found = await loadEditableLesson(user, activity.lessonId);
  return found ? { activity, ...found } : null;
}

/** Writes positions 0..n-1 in the given order (only rows whose position changed). */
async function writeOrder(
  rows: { id: string; position: number }[],
  orderedIds: string[],
  write: (id: string, position: number) => Promise<unknown>,
) {
  const current = new Map(rows.map((r) => [r.id, r.position]));
  for (const [index, id] of orderedIds.entries()) {
    if (current.get(id) !== index) await write(id, index);
  }
}

export async function lessonOrder(courseId: string) {
  const db = await getDb();
  return db
    .select({ id: lessons.id, position: lessons.position })
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(asc(lessons.position), asc(lessons.createdAt));
}

export async function activityOrder(lessonId: string) {
  const db = await getDb();
  return db
    .select({ id: activities.id, position: activities.position })
    .from(activities)
    .where(eq(activities.lessonId, lessonId))
    .orderBy(asc(activities.position), asc(activities.createdAt));
}

/** Re-number lessons of a course; pass `orderedIds` to apply a new order. */
export async function renumberLessons(courseId: string, orderedIds?: string[]) {
  const db = await getDb();
  const rows = await lessonOrder(courseId);
  await writeOrder(rows, orderedIds ?? rows.map((r) => r.id), (id, position) =>
    db.update(lessons).set({ position, updatedAt: new Date() }).where(eq(lessons.id, id)),
  );
}

export async function renumberActivities(lessonId: string, orderedIds?: string[]) {
  const db = await getDb();
  const rows = await activityOrder(lessonId);
  await writeOrder(rows, orderedIds ?? rows.map((r) => r.id), (id, position) =>
    db.update(activities).set({ position, updatedAt: new Date() }).where(eq(activities.id, id)),
  );
}

/** Bumps the course's updatedAt and recomputes its estimated minutes from the lessons. */
export async function touchCourse(courseId: string) {
  const db = await getDb();
  const rows = await db
    .select({ minutes: lessons.estimatedMinutes })
    .from(lessons)
    .where(eq(lessons.courseId, courseId));
  const minutes = rows.reduce((sum, r) => sum + r.minutes, 0);
  await db
    .update(courses)
    .set({ estimatedMinutes: Math.max(minutes, 1), updatedAt: new Date() })
    .where(eq(courses.id, courseId));
}
