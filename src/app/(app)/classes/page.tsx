import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { ClassesPage } from '@/modules/classes/pages/classes-page';

export const metadata: Metadata = { title: 'Classes' };

export default async function Page() {
  const user = await requireUser();
  return <ClassesPage user={user} />;
}
