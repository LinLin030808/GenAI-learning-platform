import type { ReactNode } from 'react';
import { requireUser } from '@/core/auth/session';
import { AppShell } from '@/shell/app-shell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
