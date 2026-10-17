import Link from 'next/link';
import { WandSparkles } from 'lucide-react';
import type { SessionUser } from '@/core/types';
import { buttonClasses, cn, EmptyState, PageHeader } from '@/components/ui';
import { getCatalog } from '../queries';
import { CourseCard } from './course-card';

export async function CatalogView({ user, subject }: { user: SessionUser; subject?: string }) {
  const { cards, profile } = await getCatalog(user);
  const subjects = [...new Set(cards.map((c) => c.subject))].sort();
  const filtered = subject ? cards.filter((c) => c.subject === subject) : cards;

  const recommendedIds = profile?.recommendedCourseIds ?? [];
  const recommended = recommendedIds
    .map((id) => cards.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c) && c!.progress?.percent !== 100)
    .slice(0, 3);
  const mine = filtered.filter((c) => c.ownerId === user.id && c.source === 'learner_ai');
  const rest = filtered.filter((c) => !mine.includes(c));

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Short mini-courses. Each lesson takes about 10 minutes and ends with something to try."
        action={
          user.role === 'learner' ? (
            <Link href="/create" className={buttonClasses('mint')}>
              <WandSparkles className="h-4 w-4" /> Learn something else
            </Link>
          ) : null
        }
      />

      {recommended.length && !subject ? (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Picked for you</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c, i) => (
              <CourseCard key={c.id} course={c} highlight={i === 0 ? 'Start here' : 'Recommended'} />
            ))}
          </div>
        </section>
      ) : null}

      {subjects.length > 1 ? (
        <nav aria-label="Filter by subject" className="mb-5 flex flex-wrap gap-2">
          <Link href="/courses" className={cn('rounded-pill border-2 border-line px-3 py-1 text-sm font-semibold', !subject ? 'bg-butter shadow-sticker-sm' : 'bg-paper')}>
            All
          </Link>
          {subjects.map((s) => (
            <Link
              key={s}
              href={`/courses?subject=${encodeURIComponent(s)}`}
              className={cn('rounded-pill border-2 border-line px-3 py-1 text-sm font-semibold', subject === s ? 'bg-butter shadow-sticker-sm' : 'bg-paper')}
            >
              {s}
            </Link>
          ))}
        </nav>
      ) : null}

      {mine.length ? (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Made by you</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-xl font-bold">{subject ?? 'All courses'}</h2>
        {rest.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <EmptyState title="No courses here yet">Try another subject, or ask Pip to make one for you.</EmptyState>
        )}
      </section>
    </div>
  );
}
