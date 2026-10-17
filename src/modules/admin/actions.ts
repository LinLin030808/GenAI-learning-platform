'use server';
// Admin mutations: change a user's role, approve or reject courses waiting for review.

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/core/auth/session';
import { getDb } from '@/core/db/client';
import { courses, users, USER_ROLES } from '@/core/db/schema';
import type { ActionResult } from '@/core/types';

const roleSchema = z.object({ userId: z.string().min(1), role: z.enum(USER_ROLES) });

export async function changeUserRole(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const admin = await requireUser(['admin']);
  const parsed = roleSchema.safeParse({ userId: formData.get('userId'), role: formData.get('role') });
  if (!parsed.success) return { ok: false, error: 'Pick learner, instructor or admin.' };
  // Prevents locking the last admin out by accident.
  if (parsed.data.userId === admin.id && parsed.data.role !== 'admin') {
    return { ok: false, error: 'You cannot change your own role. Ask another admin.' };
  }
  const db = await getDb();
  const updated = await db
    .update(users)
    .set({ role: parsed.data.role })
    .where(eq(users.id, parsed.data.userId))
    .returning({ name: users.name });
  if (updated.length === 0) return { ok: false, error: 'That user no longer exists.' };
  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return { ok: true, message: `${updated[0]?.name ?? 'User'} is now ${parsed.data.role === 'admin' ? 'an' : 'a'} ${parsed.data.role}.` };
}

const reviewSchema = z.object({ courseId: z.string().min(1) });

async function reviewCourse(formData: FormData, decision: 'approve' | 'reject'): Promise<ActionResult> {
  await requireUser(['admin']);
  const parsed = reviewSchema.safeParse({ courseId: formData.get('courseId') });
  if (!parsed.success) return { ok: false, error: 'Pick a course to review.' };
  const db = await getDb();
  const values =
    decision === 'approve'
      ? { status: 'published' as const, visibility: 'public' as const, updatedAt: new Date() }
      : { status: 'draft' as const, visibility: 'private' as const, updatedAt: new Date() };
  const updated = await db
    .update(courses)
    .set(values)
    .where(and(eq(courses.id, parsed.data.courseId), eq(courses.status, 'pending_review')))
    .returning({ title: courses.title });
  if (updated.length === 0) return { ok: false, error: 'This course is no longer waiting for review.' };
  revalidatePath('/admin/courses');
  revalidatePath('/admin');
  revalidatePath('/courses');
  const title = updated[0]?.title ?? 'The course';
  return {
    ok: true,
    message: decision === 'approve' ? `${title} is now in the public catalog.` : `${title} went back to its author as a draft.`,
  };
}

export async function approveCourse(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return reviewCourse(formData, 'approve');
}

export async function rejectCourse(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return reviewCourse(formData, 'reject');
}
