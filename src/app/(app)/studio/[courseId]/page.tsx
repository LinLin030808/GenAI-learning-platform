import { requireUser } from '@/core/auth/session';
import { CourseEditorPage } from '@/modules/studio/pages/course-editor';

export default async function StudioCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const user = await requireUser(['instructor', 'admin']);
  const [{ courseId }, { demo }] = await Promise.all([params, searchParams]);
  return <CourseEditorPage user={user} courseId={courseId} isDemo={demo === '1'} />;
}
