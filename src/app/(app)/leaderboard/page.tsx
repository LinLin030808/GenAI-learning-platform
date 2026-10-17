import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { LeaderboardView } from '@/modules/leaderboard/components/leaderboard-view';

export const metadata: Metadata = { title: 'Leaderboard' };

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; period?: string; view?: string; course?: string }>;
}) {
  const user = await requireUser();
  return <LeaderboardView user={user} params={await searchParams} />;
}
