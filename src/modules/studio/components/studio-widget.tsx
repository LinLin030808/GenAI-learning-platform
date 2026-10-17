// Home widget for instructors and admins: course counts and quick links into the studio.
import Link from 'next/link';
import { Pencil, WandSparkles } from 'lucide-react';
import type { HomeWidgetProps } from '@/core/types';
import { buttonClasses, Card, CardBody, CardHeader, Stat } from '@/components/ui';
import { getStudioOverview } from '../queries';
import { formatDate } from './course-badges';

export async function StudioWidget({ user }: HomeWidgetProps) {
  const overview = await getStudioOverview(user);
  return (
    <Card className="h-full">
      <CardHeader
        title="Course studio"
        subtitle={user.role === 'admin' ? 'All staff courses' : 'Your courses at a glance'}
      />
      <CardBody className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Drafts" value={overview.drafts} className="px-3" />
          <Stat label="Published" value={overview.published} tint="mint" className="px-3" />
          <Stat label="In review" value={overview.pending} tint="butter" className="px-3" />
        </div>
        {overview.lastEdited ? (
          <p className="text-sm">
            <span className="text-ink-soft">Last edited: </span>
            <Link href={`/studio/${overview.lastEdited.id}`} className="font-semibold underline underline-offset-2">
              {overview.lastEdited.emoji} {overview.lastEdited.title}
            </Link>
            <span className="text-ink-soft"> · {formatDate(overview.lastEdited.updatedAt)}</span>
          </p>
        ) : (
          <p className="text-sm text-ink-soft">No courses yet. Pip can draft your first one in about 30 seconds.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Link href="/studio" className={buttonClasses('secondary', 'sm')}>
            <Pencil className="h-4 w-4" aria-hidden /> Open studio
          </Link>
          <Link href="/studio/new" className={buttonClasses('mint', 'sm')}>
            <WandSparkles className="h-4 w-4" aria-hidden /> Generate a course
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
