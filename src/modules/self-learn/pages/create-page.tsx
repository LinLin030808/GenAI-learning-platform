// /create: "Learn anything" form plus the learner's own generated courses.
import Link from 'next/link';
import type { SessionUser } from '@/core/types';
import { asTint, Card, EmptyState, PageHeader, PipSays, TINT_SOLID } from '@/components/ui';
import { LearnForm } from '../components/learn-form';
import { countCoursesGeneratedToday, DAILY_COURSE_LIMIT, listOwnCourses } from '../queries';

export async function CreatePage({ user }: { user: SessionUser }) {
  const [own, today] = await Promise.all([listOwnCourses(user.id), countCoursesGeneratedToday(user.id)]);
  const firstName = user.name.split(' ')[0];
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Learn anything"
        subtitle="Type a topic. Pip writes a short course just for you, with quick activities to check you got it."
      />
      <PipSays mood="cheer" size={76}>
        <p className="font-display text-lg font-bold">What are you curious about, {firstName}?</p>
        <p className="text-sm text-ink-soft">Cooking chemistry, tax basics, a programming language. Anything goes.</p>
      </PipSays>

      <LearnForm remaining={Math.max(DAILY_COURSE_LIMIT - today, 0)} limit={DAILY_COURSE_LIMIT} />

      <section aria-labelledby="own-courses" className="flex flex-col gap-3">
        <h2 id="own-courses" className="text-xl font-bold">
          Your own courses
        </h2>
        {own.length === 0 ? (
          <EmptyState title="Nothing here yet" mood="happy">
            Courses Pip makes for you show up here. Only you can see them.
          </EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {own.map((course) => (
              <li key={course.id}>
                <Link href={`/courses/${course.slug}`} className="block h-full rounded-blob">
                  <Card interactive className="flex h-full items-start gap-3 p-4">
                    <span
                      aria-hidden
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-line text-2xl ${TINT_SOLID[asTint(course.color)]}`}
                    >
                      {course.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-lg leading-tight font-bold">{course.title}</span>
                      <span className="mt-1 block text-sm text-ink-soft">
                        {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
                      </span>
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
