import { requireUser } from '@/core/auth/session';
import { LessonView } from '@/modules/courses/components/lesson-view';

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const user = await requireUser();
  const { slug, lessonId } = await params;
  return <LessonView user={user} slug={slug} lessonId={lessonId} />;
}
