// Status / visibility badges shared by the studio list, editor and home widget.
import type { CourseStatus, CourseVisibility } from '@/core/db/schema';
import { Badge, type Tint } from '@/components/ui';

const STATUS: Record<CourseStatus, { label: string; tint: Tint }> = {
  draft: { label: 'Draft', tint: 'paper' },
  pending_review: { label: 'Waiting for review', tint: 'butter' },
  published: { label: 'Published', tint: 'mint' },
  archived: { label: 'Archived', tint: 'lilac' },
};

const VISIBILITY: Record<CourseVisibility, string> = {
  public: 'Public catalog',
  class: 'My classes',
  private: 'Only me',
};

export function StatusBadge({ status }: { status: CourseStatus }) {
  const s = STATUS[status] ?? STATUS.draft;
  return <Badge tint={s.tint}>{s.label}</Badge>;
}

export function VisibilityBadge({ visibility }: { visibility: CourseVisibility }) {
  return <Badge tint="sky">{VISIBILITY[visibility] ?? visibility}</Badge>;
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
