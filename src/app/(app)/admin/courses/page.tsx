import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { AdminCoursesPage, parseCourseFilters } from '@/modules/admin/pages/courses-page';

export const metadata: Metadata = { title: 'Courses · Admin' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser(['admin']);
  return <AdminCoursesPage filters={parseCourseFilters(await searchParams)} />;
}
