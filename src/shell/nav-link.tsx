'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/components/ui';

export function NavLink({ href, children, compact }: { href: string; children: ReactNode; compact?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/home' && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-pill border-2 font-display font-semibold transition-colors',
        compact ? 'shrink-0 px-3 py-1.5 text-sm' : 'px-4 py-2',
        active
          ? 'border-line bg-butter shadow-sticker-sm'
          : 'border-transparent text-ink-soft hover:border-line/30 hover:bg-paper hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
