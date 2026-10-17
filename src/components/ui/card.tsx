import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type Tint = 'paper' | 'coral' | 'mint' | 'butter' | 'sky' | 'lilac';

export const TINT_BG: Record<Tint, string> = {
  paper: 'bg-paper',
  coral: 'bg-coral-soft',
  mint: 'bg-mint-soft',
  butter: 'bg-butter-soft',
  sky: 'bg-sky-soft',
  lilac: 'bg-lilac-soft',
};

export const TINT_SOLID: Record<Tint, string> = {
  paper: 'bg-paper',
  coral: 'bg-coral',
  mint: 'bg-mint',
  butter: 'bg-butter',
  sky: 'bg-sky',
  lilac: 'bg-lilac',
};

/** Accepts any string (e.g. a course.color from the DB) and falls back to mint. */
export function asTint(value: string | null | undefined): Tint {
  return value && value in TINT_BG ? (value as Tint) : 'mint';
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tint?: Tint;
  /** Lifts on hover, for clickable cards */
  interactive?: boolean;
}

export function Card({ tint = 'paper', interactive, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-blob border-2 border-line shadow-sticker',
        TINT_BG[tint],
        interactive && 'transition-transform duration-150 hover:-translate-y-1 hover:shadow-sticker-lg',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h3 className="text-lg font-bold">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-3 pb-5', className)} {...props} />;
}
