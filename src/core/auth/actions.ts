'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/core/db/client';
import { learnerProfiles, users } from '@/core/db/schema';
import { newId, randomString } from '@/core/ids';
import type { ActionResult } from '@/core/types';
import { hashPassword, verifyPassword } from './password';
import { createSession, destroySession } from './session';

const loginSchema = z.object({
  email: z.email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
});

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Enter your email and password.' };
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: 'That email and password do not match.' };
  }
  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id);
  redirect('/home');
}

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Tell us what to call you.').max(60),
  email: z.email('That does not look like an email.').transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, 'Use at least 8 characters.'),
  // Admin accounts are only created by the seed script or another admin.
  role: z.enum(['learner', 'instructor']),
});

export async function signup(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors };
  }
  const db = await getDb();
  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (taken) return { ok: false, error: 'An account with that email already exists.', fieldErrors: { email: 'Already registered' } };
  const id = newId('user');
  await db.insert(users).values({
    id,
    email: parsed.data.email,
    name: parsed.data.name,
    role: parsed.data.role,
    passwordHash: await hashPassword(parsed.data.password),
    avatarSeed: randomString(8),
    lastActiveAt: new Date(),
  });
  await createSession(id);
  redirect(parsed.data.role === 'learner' ? '/onboarding' : '/home');
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/');
}

/** Used by onboarding redirects: does this learner have a profile yet? */
export async function hasLearnerProfile(userId: string): Promise<boolean> {
  const db = await getDb();
  const [row] = await db
    .select({ id: learnerProfiles.userId })
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, userId))
    .limit(1);
  return Boolean(row);
}
