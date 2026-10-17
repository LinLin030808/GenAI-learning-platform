import { requireUser } from '@/core/auth/session';
import { NewCoursePage } from '@/modules/studio/pages/new-course';

export default async function StudioNewPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  await requireUser(['instructor', 'admin']);
  const { mode } = await searchParams;
  return <NewCoursePage mode={mode} />;
}
