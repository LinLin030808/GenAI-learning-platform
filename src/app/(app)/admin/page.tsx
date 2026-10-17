import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { AdminOverviewPage } from '@/modules/admin/pages/overview-page';

export const metadata: Metadata = { title: 'Admin' };

export default async function Page() {
  await requireUser(['admin']);
  return <AdminOverviewPage />;
}
