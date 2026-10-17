// /admin: platform numbers and links into each part of the console.
import Link from 'next/link';
import { ArrowRight, BookOpen, Bot, Boxes, Users } from 'lucide-react';
import { Card, CardBody, CardHeader, PageHeader, Stat } from '@/components/ui';
import { AdminNav } from '../components/admin-nav';
import { getAdminOverview } from '../queries';

const STATUS_LABEL = { draft: 'Draft', pending_review: 'Waiting review', published: 'Published', archived: 'Archived' } as const;

export async function AdminOverviewPage() {
  const o = await getAdminOverview();
  const links = [
    { href: '/admin/users', icon: Users, title: 'Users and roles', body: 'Search people and change who is a learner, instructor or admin.' },
    {
      href: '/admin/courses',
      icon: BookOpen,
      title: 'Course review',
      body: o.coursesByStatus.pending_review
        ? `${o.coursesByStatus.pending_review} waiting for review. Approve or send back.`
        : 'Nothing waiting. Browse every course with filters.',
    },
    { href: '/admin/ai-usage', icon: Bot, title: 'AI usage', body: 'Calls per feature, real vs demo mode, tokens and speed.' },
    { href: '/admin/modules', icon: Boxes, title: 'Modules', body: 'Feature modules installed in this build.' },
  ];

  return (
    <div>
      <PageHeader title="Admin console" subtitle="Keep an eye on people, courses and AI calls." />
      <AdminNav current="/admin" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="People" />
          <CardBody className="grid grid-cols-3 gap-2">
            <Stat label="Learners" value={o.usersByRole.learner} tint="mint" />
            <Stat label="Instructors" value={o.usersByRole.instructor} tint="sky" />
            <Stat label="Admins" value={o.usersByRole.admin} tint="lilac" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Courses" />
          <CardBody className="grid grid-cols-2 gap-2">
            {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => (
              <Stat
                key={s}
                label={STATUS_LABEL[s]}
                value={o.coursesByStatus[s]}
                tint={s === 'pending_review' && o.coursesByStatus[s] > 0 ? 'butter' : 'paper'}
              />
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Last 7 days" />
          <CardBody className="grid grid-cols-2 gap-2">
            <Stat label="Learning events" value={o.eventsLast7Days} tint="mint" />
            <Stat label="Active people" value={o.activeLearners7Days} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="AI calls today" subtitle="Since midnight UTC" />
          <CardBody className="grid grid-cols-2 gap-2">
            <Stat label="Real AI" value={o.aiToday.real} tint="lilac" />
            <Stat label="Demo mode" value={o.aiToday.mock} tint="butter" />
          </CardBody>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-xl font-bold">Go to</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, icon: Icon, title, body }) => (
          <li key={href}>
            <Link href={href} className="block h-full">
              <Card interactive className="flex h-full items-start gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-line bg-butter-soft">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">{title}</span>
                  <span className="block text-sm text-ink-soft">{body}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0" aria-hidden />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
