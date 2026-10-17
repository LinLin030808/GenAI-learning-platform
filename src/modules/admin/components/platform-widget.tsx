// Home widget for admins: a quick look at the platform with a link to the console.
import Link from 'next/link';
import type { HomeWidgetProps } from '@/core/types';
import { buttonClasses, Card, CardBody, CardHeader, Stat } from '@/components/ui';
import { getAdminOverview } from '../queries';

export async function PlatformWidget(_props: HomeWidgetProps) {
  const o = await getAdminOverview();
  const totalUsers = o.usersByRole.learner + o.usersByRole.instructor + o.usersByRole.admin;
  const pending = o.coursesByStatus.pending_review;
  return (
    <Card tint="lilac" className="h-full">
      <CardHeader
        title="Platform"
        subtitle="Sprout at a glance"
        action={
          <Link href="/admin" className={buttonClasses('secondary', 'sm')}>
            Admin
          </Link>
        }
      />
      <CardBody className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Users" value={totalUsers} />
          <Stat label="Events, 7 days" value={o.eventsLast7Days} />
          <Stat label="AI calls today" value={o.aiToday.real + o.aiToday.mock} />
          <Stat label="Waiting review" value={pending} tint={pending ? 'butter' : 'paper'} />
        </div>
        {pending ? (
          <Link href="/admin/courses" className="text-sm font-semibold text-coral-deep underline underline-offset-2">
            Review {pending} course{pending === 1 ? '' : 's'}
          </Link>
        ) : null}
      </CardBody>
    </Card>
  );
}
