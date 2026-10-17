// /admin/courses: the review queue (pending_review) and a filterable list of every course.
import Form from 'next/form';
import Link from 'next/link';
import { z } from 'zod';
import { Badge, Button, buttonClasses, Card, CardBody, CardHeader, EmptyState, PageHeader, Select, type Tint } from '@/components/ui';
import { AdminNav } from '../components/admin-nav';
import { ReviewButtons } from '../components/review-buttons';
import {
  COURSE_SOURCES,
  COURSE_STATUSES,
  listCourseOwners,
  listCourses,
  listPendingCourses,
  type CourseFilters,
} from '../queries';

const STATUS_LABEL = { draft: 'Draft', pending_review: 'Waiting review', published: 'Published', archived: 'Archived' } as const;
const STATUS_TINT: Record<keyof typeof STATUS_LABEL, Tint> = {
  draft: 'paper',
  pending_review: 'butter',
  published: 'mint',
  archived: 'coral',
};
const SOURCE_LABEL = { seed: 'Seed', manual: 'Written by hand', ai: 'AI (instructor)', learner_ai: 'AI (learner)' } as const;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const filtersSchema = z.object({
  status: z.enum(COURSE_STATUSES).optional().catch(undefined),
  source: z.enum(COURSE_SOURCES).optional().catch(undefined),
  ownerId: z.string().max(40).optional().catch(undefined),
});

export function parseCourseFilters(params: Record<string, string | string[] | undefined>): CourseFilters {
  return filtersSchema.parse({ status: first(params.status), source: first(params.source), ownerId: first(params.owner) });
}

const dateLabel = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export async function AdminCoursesPage({ filters }: { filters: CourseFilters }) {
  const [pending, all, owners] = await Promise.all([listPendingCourses(), listCourses(filters), listCourseOwners()]);
  const isFiltered = Boolean(filters.status || filters.source || filters.ownerId);

  return (
    <div>
      <PageHeader title="Courses" subtitle="Review what people want to publish, and browse everything else." />
      <AdminNav current="/admin/courses" />

      <section aria-labelledby="queue-heading" className="mb-8">
        <h2 id="queue-heading" className="mb-3 text-xl font-bold">
          Review queue <Badge tint={pending.length ? 'butter' : 'paper'}>{pending.length}</Badge>
        </h2>
        {pending.length === 0 ? (
          <EmptyState title="Queue is empty" mood="happy">
            Nothing is waiting for review right now.
          </EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((c) => (
              <Card key={c.id} tint="butter">
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{c.emoji}</span>
                      {c.title}
                    </span>
                  }
                  subtitle={`${c.subject} · ${c.lessonCount} lesson${c.lessonCount === 1 ? '' : 's'} · by ${c.ownerName ?? 'unknown'}`}
                />
                <CardBody className="flex flex-col gap-3">
                  {c.summary ? <p className="text-sm">{c.summary}</p> : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tint="paper">{SOURCE_LABEL[c.source]}</Badge>
                    <Link href={`/courses/${c.slug}`} className="text-sm font-semibold underline underline-offset-2">
                      Preview course
                    </Link>
                  </div>
                  <ReviewButtons courseId={c.id} title={c.title} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="all-heading">
        <h2 id="all-heading" className="mb-3 text-xl font-bold">
          All courses
        </h2>
        <Form action="/admin/courses" className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="f-status" className="font-display text-sm font-semibold">Status</label>
            <Select id="f-status" name="status" defaultValue={filters.status ?? ''} className="w-44">
              <option value="">Any status</option>
              {COURSE_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-source" className="font-display text-sm font-semibold">Source</label>
            <Select id="f-source" name="source" defaultValue={filters.source ?? ''} className="w-44">
              <option value="">Any source</option>
              {COURSE_SOURCES.map((s) => (
                <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-owner" className="font-display text-sm font-semibold">Owner</label>
            <Select id="f-owner" name="owner" defaultValue={filters.ownerId ?? ''} className="w-44">
              <option value="">Anyone</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary">Apply filters</Button>
          {isFiltered ? (
            <Link href="/admin/courses" className={buttonClasses('ghost')}>Clear</Link>
          ) : null}
        </Form>
        <Card>
          <CardBody className="pt-5">
            {all.length === 0 ? (
              <EmptyState title="No courses match">Try a different filter.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <thead className="font-display text-ink-soft">
                    <tr>
                      <th scope="col" className="py-2 pr-3">Course</th>
                      <th scope="col" className="py-2 pr-3">Status</th>
                      <th scope="col" className="py-2 pr-3">Visibility</th>
                      <th scope="col" className="py-2 pr-3">Source</th>
                      <th scope="col" className="py-2 pr-3">Owner</th>
                      <th scope="col" className="py-2 pr-3">Lessons</th>
                      <th scope="col" className="py-2">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {all.map((c) => (
                      <tr key={c.id} className="border-t-2 border-line/15">
                        <td className="py-2.5 pr-3">
                          <Link href={`/courses/${c.slug}`} className="flex items-center gap-2 font-semibold hover:underline">
                            <span aria-hidden>{c.emoji}</span>
                            {c.title}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3"><Badge tint={STATUS_TINT[c.status]}>{STATUS_LABEL[c.status]}</Badge></td>
                        <td className="py-2.5 pr-3 capitalize">{c.visibility}</td>
                        <td className="py-2.5 pr-3">{SOURCE_LABEL[c.source]}</td>
                        <td className="py-2.5 pr-3">{c.ownerName ?? '–'}</td>
                        <td className="py-2.5 pr-3">{c.lessonCount}</td>
                        <td className="py-2.5">{dateLabel(c.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
