import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { AdminAiUsagePage } from '@/modules/admin/pages/ai-usage-page';

export const metadata: Metadata = { title: 'AI usage · Admin' };

export default async function Page() {
  await requireUser(['admin']);
  return <AdminAiUsagePage />;
}
