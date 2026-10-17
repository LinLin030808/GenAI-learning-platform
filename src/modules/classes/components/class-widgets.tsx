// Home widgets: "Class pulse" for staff and "My classes" for learners.
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import type { HomeWidgetProps } from '@/core/types';
import { buttonClasses, Card, CardBody, CardHeader, EmptyState, Stat } from '@/components/ui';
import { getClassPulse, listLearnerClasses } from '../queries';

export async function ClassPulseWidget({ user }: HomeWidgetProps) {
  const pulse = await getClassPulse(user);
  return (
    <Card tint="sky" className="h-full">
      <CardHeader
        title="Class pulse"
        subtitle={user.role === 'admin' ? 'All classes, last 7 days' : 'Your classes, last 7 days'}
        action={
          <Link href="/classes" className={buttonClasses('secondary', 'sm')}>
            Classes
          </Link>
        }
      />
      <CardBody>
        {pulse.classCount === 0 ? (
          <EmptyState title="No classes yet" mood="happy">
            Create a class to get an invite code for your students.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Classes" value={pulse.classCount} />
              <Stat label="Students" value={pulse.studentCount} />
              <Stat label="Active" value={pulse.activeThisWeek} tint="mint" />
            </div>
            {pulse.busiest ? (
              <Link
                href={`/classes/${pulse.busiest.id}?tab=engagement`}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-line bg-paper px-3 py-2 font-semibold hover:bg-butter-soft"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-ink-soft">Busiest this week</span>
                  <span className="block truncate">
                    {pulse.busiest.name} · {pulse.busiest.events} events
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            ) : (
              <p className="text-sm text-ink-soft">Quiet week so far. No student activity yet.</p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export async function MyClassesWidget({ user }: HomeWidgetProps) {
  const list = await listLearnerClasses(user.id);
  return (
    <Card className="h-full">
      <CardHeader
        title="My classes"
        action={
          <Link href="/classes" className={buttonClasses('secondary', 'sm')}>
            {list.length ? 'See all' : 'Join a class'}
          </Link>
        }
      />
      <CardBody>
        {list.length === 0 ? (
          <p className="text-sm text-ink-soft">Got an invite code from your teacher? Join their class to see the courses they picked.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.slice(0, 4).map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border-2 border-line bg-paper px-3 py-2">
                <Users className="h-4 w-4 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.name}</div>
                  <div className="text-xs text-ink-soft">
                    {c.instructorName} · {c.courses.length} course{c.courses.length === 1 ? '' : 's'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
