import { requireUser } from '@/core/auth/session';
import { LessonEditorPage } from '@/modules/studio/pages/lesson-editor';

export default async function StudioLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const user = await requireUser(['instructor', 'admin']);
  const { courseId, lessonId } = await params;
  return <LessonEditorPage user={user} courseId={courseId} lessonId={lessonId} />;
}
