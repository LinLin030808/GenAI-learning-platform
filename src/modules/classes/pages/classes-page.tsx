// /classes: staff see the classes they run (admins: all) and can create one; learners see
// the classes they joined and can join with an invite code.
import Link from 'next/link';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import type { SessionUser } from '@/core/types';
import { Badge, buttonClasses, Card, CardBody, CardHeader, EmptyState, PageHeader, asTint, TINT_BG, cn } from '@/components/ui';
import { CreateClassForm, JoinClassForm } from '../components/class-forms';
import { CopyButton } from '../components/copy-button';
import { listLearnerClasses, listStaffClasses } from '../queries';

export async function ClassesPage({ user }: { user: SessionUser }) {
  return user.role === 'learner' ? <LearnerClasses user={user} /> : <StaffClasses user={user} />;
}

async function StaffClasses({ user }: { user: SessionUser }) {
  const list = await listStaffClasses(user);
  return (
    <div>
      <PageHeader
        title="Your classes"
        subtitle={
          user.role === 'admin'
            ? 'Every class on Sprout. Open one to manage students, courses and engagement.'
            : 'Import students, assign courses and see who might need a nudge.'
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Class list" className="flex flex-col gap-4">
          {list.length === 0 ? (
            <EmptyState title="No classes yet">
              Create your first class on the right. You will get an invite code to share.
            </EmptyState>
          ) : (
            list.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold">
                      <Link href={`/classes/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </h2>
                    {c.description ? <p className="mt-1 text-sm text-ink-soft">{c.description}</p> : null}
                    {user.role === 'admin' ? (
                      <p className="mt-1 text-xs font-semibold text-ink-soft">Run by {c.instructorName}</p>
                    ) : null}
                  </div>
                  <Link href={`/classes/${c.id}`} className={buttonClasses('secondary', 'sm')}>
                    Open class <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tint="sky">
                    <Users className="h-3.5 w-3.5" aria-hidden /> {c.memberCount} student{c.memberCount === 1 ? '' : 's'}
                  </Badge>
                  <Badge tint="mint">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden /> {c.courseCount} course{c.courseCount === 1 ? '' : 's'}
                  </Badge>
                  <span className="ml-auto flex items-center gap-2 text-sm">
                    <span className="text-ink-soft">Invite code</span>
                    <code className="rounded-lg border-2 border-line bg-butter-soft px-2 py-0.5 font-mono font-bold tracking-widest">
                      {c.inviteCode}
                    </code>
                    <CopyButton value={c.inviteCode} label="Copy" variant="ghost" />
                  </span>
                </div>
              </Card>
            ))
          )}
        </section>
        <Card tint="sky" className="h-fit">
          <CardHeader title="New class" subtitle="Students join with the invite code, or you import them." />
          <CardBody>
            <CreateClassForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

async function LearnerClasses({ user }: { user: SessionUser }) {
  const list = await listLearnerClasses(user.id);
  return (
    <div>
      <PageHeader title="My classes" subtitle="Classes you belong to and the courses your teachers picked for you." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Joined classes" className="flex flex-col gap-4">
          {list.length === 0 ? (
            <EmptyState title="You are not in a class yet" mood="happy">
              Got an invite code from your teacher? Pop it in the box and you are in.
            </EmptyState>
          ) : (
            list.map((c) => (
              <Card key={c.id}>
                <CardHeader title={c.name} subtitle={`With ${c.instructorName}`} />
                <CardBody>
                  {c.description ? <p className="mb-3 text-sm text-ink-soft">{c.description}</p> : null}
                  {c.courses.length === 0 ? (
                    <p className="text-sm text-ink-soft">No courses assigned yet.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {c.courses.map((course) => (
                        <li key={course.id}>
                          <Link
                            href={`/courses/${course.slug}`}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-pill border-2 border-line px-3 py-1 text-sm font-semibold shadow-sticker-sm hover:-translate-y-0.5',
                              TINT_BG[asTint(course.color)],
                            )}
                          >
                            <span aria-hidden>{course.emoji}</span>
                            {course.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </section>
        <Card tint="butter" className="h-fit">
          <CardHeader title="Join with a code" />
          <CardBody>
            <JoinClassForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
