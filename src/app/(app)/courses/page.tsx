import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { CatalogView } from '@/modules/courses/components/catalog-view';

export const metadata: Metadata = { title: 'Courses' };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const user = await requireUser();
  const { subject } = await searchParams;
  return <CatalogView user={user} subject={subject} />;
}
