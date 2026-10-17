// Session = signed JWT in an httpOnly cookie. No session table; logout clears the cookie.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { jwtVerify, SignJWT } from 'jose';
import { getDb } from '@/core/db/client';
import { users, type UserRole } from '@/core/db/schema';
import type { SessionUser } from '@/core/types';

const COOKIE_NAME = 'sprout_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEV_SECRET = 'dev-only-secret-change-me-dev-only-secret';

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      throw new Error('AUTH_SECRET must be set in production.');
    }
    return new TextEncoder().encode(DEV_SECRET);
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Current user, or null when signed out. Reads the DB so role changes apply immediately. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    const db = await getDb();
    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarSeed: users.avatarSeed,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

/**
 * Use at the top of every protected page, layout and server action.
 * Redirects to /login when signed out and to /home when the role is not allowed.
 */
export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (roles && !roles.includes(user.role)) redirect('/home');
  return user;
}

/** Admins can do everything instructors can. */
export function isStaff(role: UserRole): boolean {
  return role === 'instructor' || role === 'admin';
}
