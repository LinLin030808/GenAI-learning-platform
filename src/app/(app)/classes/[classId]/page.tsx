import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { ClassDetailPage, parseClassTab } from '@/modules/classes/pages/class-detail-page';

export const metadata: Metadata = { title: 'Class' };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const user = await requireUser(['instructor', 'admin']);
  const [{ classId }, { tab }] = await Promise.all([params, searchParams]);
  return <ClassDetailPage user={user} classId={classId} tab={parseClassTab(tab)} />;
}
