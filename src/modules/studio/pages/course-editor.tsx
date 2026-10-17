// /studio/[courseId]: course details, lesson list and the publishing panel.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { COURSE_COLORS } from '@/core/content/draft';
import { canEditCourse, getCourseOutline, type CourseOutline } from '@/core/content/queries';
import type { SessionUser } from '@/core/types';
import { buttonClasses, Card, CardBody, CardHeader, EmptyState, Notice, PageHeader } from '@/components/ui';
import { addLesson, deleteLesson, moveLesson, setCourseStatus } from '../actions';
import { ActionButton } from '../components/action-button';
import { StatusBadge, VisibilityBadge } from '../components/course-badges';
import { CourseMetaForm } from '../components/course-meta-form';

function LessonList({ course }: { course: CourseOutline }) {
  const last = course.lessons.length - 1;
  return (
    <Card>
      <CardHeader
        title="Lessons"
        subtitle={`${course.lessons.length} lesson${course.lessons.length === 1 ? '' : 's'} · about ${course.estimatedMinutes} min`}
        action={
          <ActionButton action={addLesson} fields={{ courseId: course.id }} variant="mint" pendingText="Adding…">
            <Plus className="h-4 w-4" aria-hidden /> Add lesson
          </ActionButton>
        }
      />
      <CardBody>
        {course.lessons.length === 0 ? (
          <EmptyState title="No lessons yet">Add a lesson to start writing.</EmptyState>
        ) : (
          <ol className="flex flex-col gap-2">
            {course.lessons.map((lesson, i) => (
              <li
                key={lesson.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-line bg-paper px-3 py-2"
              >
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-line bg-butter-soft font-display font-bold"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/studio/${course.id}/lessons/${lesson.id}`}
                    className="font-semibold hover:underline"
                  >
                    <span className="sr-only">Lesson {i + 1}: </span>
                    {lesson.title}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {lesson.estimatedMinutes} min · {lesson.activities.length} activit
                    {lesson.activities.length === 1 ? 'y' : 'ies'}
                  </p>
                </div>
                <div className="flex items-start gap-1">
                  <ActionButton
                    action={moveLesson}
                    fields={{ lessonId: lesson.id, direction: 'up' }}
                    variant="ghost"
                    disabled={i === 0}
                    ariaLabel={`Move “${lesson.title}” up`}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </ActionButton>
                  <ActionButton
                    action={moveLesson}
                    fields={{ lessonId: lesson.id, direction: 'down' }}
                    variant="ghost"
                    disabled={i === last}
                    ariaLabel={`Move “${lesson.title}” down`}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </ActionButton>
                  <Link
                    href={`/studio/${course.id}/lessons/${lesson.id}`}
                    className={buttonClasses('secondary', 'sm')}
                    aria-label={`Edit “${lesson.title}”`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </Link>
                  <ActionButton
                    action={deleteLesson}
                    fields={{ lessonId: lesson.id }}
                    variant="danger"
                    confirmText={`Delete “${lesson.title}” and its activities? This cannot be undone.`}
                    ariaLabel={`Delete “${lesson.title}”`}
                    disabled={course.lessons.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </ActionButton>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}

function PublishPanel({ course }: { course: CourseOutline }) {
  const fields = (intent: string) => ({ courseId: course.id, intent });
  const isLive = course.status === 'published';
  return (
    <Card tint="sky">
      <CardHeader title="Publishing" subtitle="Who can open this course." />
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={course.status} />
          <VisibilityBadge visibility={course.visibility} />
        </div>
        {course.status === 'pending_review' ? (
          <Notice>Waiting for an admin to approve it for the public catalog.</Notice>
        ) : null}
        {course.status === 'archived' ? <Notice>Archived. Publish it again to bring it back.</Notice> : null}

        <div className="flex flex-col items-stretch gap-2">
          {!(isLive && course.visibility === 'class') ? (
            <ActionButton
              action={setCourseStatus}
              fields={fields('publish_class')}
              variant="primary"
              size="md"
              pendingText="Publishing…"
              showMessage
            >
              Publish to my classes
            </ActionButton>
          ) : null}
          {course.status !== 'pending_review' && !(isLive && course.visibility === 'public') ? (
            <ActionButton
              action={setCourseStatus}
              fields={fields('submit_public')}
              variant="secondary"
              size="md"
              pendingText="Sending…"
              showMessage
            >
              Submit to public catalog
            </ActionButton>
          ) : null}
          {course.status !== 'draft' ? (
            <ActionButton
              action={setCourseStatus}
              fields={fields('unpublish')}
              variant="secondary"
              pendingText="Saving…"
              showMessage
            >
              Unpublish (back to draft)
            </ActionButton>
          ) : null}
          {course.status !== 'archived' ? (
            <ActionButton
              action={setCourseStatus}
              fields={fields('archive')}
              variant="ghost"
              pendingText="Archiving…"
              confirmText="Archive this course? Learners will no longer see it."
              showMessage
            >
              Archive
            </ActionButton>
          ) : null}
        </div>

        <div className="rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm">
          <p className="font-semibold">Course link</p>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1 break-all text-coral-deep underline underline-offset-2"
          >
            /courses/{course.slug} <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
          <p className="mt-1 text-ink-soft">Open it to see the course the way learners do.</p>
        </div>
      </CardBody>
    </Card>
  );
}

export async function CourseEditorPage({
  user,
  courseId,
  isDemo,
}: {
  user: SessionUser;
  courseId: string;
  isDemo: boolean;
}) {
  const course = await getCourseOutline(courseId);
  if (!course || !(await canEditCourse(user, course))) notFound();

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link href="/studio" className={buttonClasses('ghost', 'sm', '-ml-3')}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Studio
          </Link>
        }
        title={
          <span>
            <span aria-hidden>{course.emoji} </span>
            {course.title}
          </span>
        }
        subtitle={course.summary || 'Add a short summary so learners know what they will get.'}
      />

      {isDemo ? (
        <Notice className="mb-6">
          This is demo content: no AI key is set up, so Pip used a sample course. Add an AI_API_KEY to
          generate a real one, or edit this draft by hand.
        </Notice>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Course details" />
            <CardBody>
              <CourseMetaForm
                colors={COURSE_COLORS}
                course={{
                  id: course.id,
                  title: course.title,
                  summary: course.summary,
                  subject: course.subject,
                  level: course.level,
                  audience: course.audience,
                  tags: course.tags,
                  emoji: course.emoji,
                  color: course.color,
                }}
              />
            </CardBody>
          </Card>
          <LessonList course={course} />
        </div>
        <PublishPanel course={course} />
      </div>
    </div>
  );
}
