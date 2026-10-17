'use server';
// Tiny lookup for the "Talking about: <lesson>" chip in the tutor panel.

import { z } from 'zod';
import { requireUser } from '@/core/auth/session';
import type { ActionResult } from '@/core/types';
import { loadLessonContext } from './context';

const lessonIdSchema = z.string().min(1).max(64);

export async function getTutorLessonTitle(
  lessonId: string,
): Promise<ActionResult<{ title: string; courseTitle: string }>> {
  const user = await requireUser();
  const parsed = lessonIdSchema.safeParse(lessonId);
  if (!parsed.success) return { ok: false, error: 'Unknown lesson.' };
  const lesson = await loadLessonContext(user, parsed.data);
  if (!lesson) return { ok: false, error: 'Lesson not found.' };
  return { ok: true, data: { title: lesson.title, courseTitle: lesson.courseTitle } };
}
