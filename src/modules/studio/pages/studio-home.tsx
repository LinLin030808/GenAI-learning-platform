// /studio: the instructor's own courses plus published courses they can duplicate.
import Link from 'next/link';
import { Copy, Pencil, Plus, WandSparkles } from 'lucide-react';
import type { SessionUser } from '@/core/types';
import { asTint, buttonClasses, Card, EmptyState, PageHeader, TINT_SOLID } from '@/components/ui';
import { duplicateCourse } from '../actions';
import { ActionButton } from '../components/action-button';
import { formatDate, StatusBadge, VisibilityBadge } from '../components/course-badges';
import { listForkableCourses, listStudioCourses, type StudioCourse } from '../queries';

function CourseEmoji({ course }: { course: StudioCourse }) {
  return (
    <div
      aria-hidden
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-line text-2xl ${TINT_SOLID[asTint(course.color)]}`}
    >
      {course.emoji}
    </div>
  );
}

function lessonsLabel(n: number) {
  return `${n} lesson${n === 1 ? '' : 's'}`;
}

export async function StudioHomePage({ user }: { user: SessionUser }) {
  const [mine, catalog] = await Promise.all([listStudioCourses(user), listForkableCourses(user)]);
  return (
    <div>
      <PageHeader
        title="Course studio"
        subtitle={
          user.role === 'admin'
            ? 'Every course made by staff. Edit, publish, or duplicate one to customise it.'
            : 'Write mini-courses for your classes, or let Pip draft one for you to edit.'
        }
        action={
          <>
            <Link href="/studio/new?mode=blank" className={buttonClasses('secondary')}>
              <Plus className="h-4 w-4" aria-hidden /> New course
            </Link>
            <Link href="/studio/new" className={buttonClasses('primary')}>
              <WandSparkles className="h-4 w-4" aria-hidden /> Generate with AI
            </Link>
          </>
        }
      />

      <section aria-labelledby="my-courses" className="flex flex-col gap-3">
        <h2 id="my-courses" className="text-xl font-bold">
          {user.role === 'admin' ? 'All staff courses' : 'My courses'}
        </h2>
        {mine.length === 0 ? (
          <EmptyState
            title="No courses yet"
            mood="happy"
            action={
              <Link href="/studio/new" className={buttonClasses('primary', 'sm')}>
                Generate your first course
              </Link>
            }
          >
            Start from a topic and Pip drafts the lessons and activities. You can change everything after.
          </EmptyState>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {mine.map((course) => (
              <li key={course.id}>
                <Card className="flex h-full items-start gap-3 p-4">
                  <CourseEmoji course={course} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/studio/${course.id}`}
                      className="font-display text-lg leading-tight font-bold hover:underline"
                    >
                      {course.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <StatusBadge status={course.status} />
                      <VisibilityBadge visibility={course.visibility} />
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">
                      {lessonsLabel(course.lessonCount)} · edited {formatDate(course.updatedAt)}
                      {course.source === 'ai' ? ' · drafted by Pip' : ''}
                    </p>
                  </div>
                  <Link
                    href={`/studio/${course.id}`}
                    className={buttonClasses('secondary', 'sm')}
                    aria-label={`Edit ${course.title}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden /> Edit
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="catalog" className="mt-10 flex flex-col gap-3">
        <div>
          <h2 id="catalog" className="text-xl font-bold">
            Start from an existing course
          </h2>
          <p className="text-sm text-ink-soft">
            Duplicate a published course to get your own private copy. The original stays as it is.
          </p>
        </div>
        {catalog.length === 0 ? (
          <EmptyState title="Nothing to duplicate yet">Published courses from other teachers show up here.</EmptyState>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {catalog.map((course) => (
              <li key={course.id}>
                <Card className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <CourseEmoji course={course} />
                    <div className="min-w-0">
                      <Link href={`/courses/${course.slug}`} className="font-display font-bold hover:underline">
                        {course.title}
                      </Link>
                      <p className="text-sm text-ink-soft">
                        {course.subject} · {lessonsLabel(course.lessonCount)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <ActionButton
                      action={duplicateCourse}
                      fields={{ courseId: course.id }}
                      pendingText="Copying…"
                      ariaLabel={`Duplicate ${course.title}`}
                    >
                      <Copy className="h-4 w-4" aria-hidden /> Duplicate
                    </ActionButton>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
