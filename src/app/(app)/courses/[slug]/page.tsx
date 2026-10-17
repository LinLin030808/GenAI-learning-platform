import { requireUser } from '@/core/auth/session';
import { CourseView } from '@/modules/courses/components/course-view';

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  return <CourseView user={user} slug={slug} />;
}
