// Sub-navigation shared by the admin pages.
import Link from 'next/link';
import { buttonClasses } from '@/components/ui';

export const ADMIN_SECTIONS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/ai-usage', label: 'AI usage' },
  { href: '/admin/modules', label: 'Modules' },
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number]['href'];

export function AdminNav({ current }: { current: AdminSection }) {
  return (
    <nav aria-label="Admin sections" className="mb-6 flex flex-wrap gap-2">
      {ADMIN_SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          aria-current={s.href === current ? 'page' : undefined}
          className={buttonClasses(s.href === current ? 'butter' : 'secondary', 'sm')}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
