import type { HTMLAttributes } from 'react';
import { TINT_BG, type Tint } from './card';
import { cn } from './cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tint?: Tint;
}

export function Badge({ tint = 'butter', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border-2 border-line px-2.5 py-0.5',
        'font-display text-xs font-semibold whitespace-nowrap',
        TINT_BG[tint],
        className,
      )}
      {...props}
    />
  );
}
