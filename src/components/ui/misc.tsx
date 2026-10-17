import type { ReactNode } from 'react';
import { TINT_BG, type Tint } from './card';
import { cn } from './cn';
import { Pip, type PipMood } from './pip';

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-sm font-semibold text-ink-soft">{eyebrow}</div> : null}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-ink-soft">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

export function EmptyState({
  title,
  children,
  action,
  mood = 'think',
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  mood?: PipMood;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-blob border-2 border-dashed border-line/50 px-6 py-10 text-center">
      <Pip mood={mood} size={80} />
      <h3 className="text-lg font-bold">{title}</h3>
      {children ? <div className="max-w-md text-ink-soft">{children}</div> : null}
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  icon,
  tint = 'paper',
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tint?: Tint;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-blob border-2 border-line px-4 py-3 shadow-sticker-sm',
        TINT_BG[tint],
        className,
      )}
    >
      {icon ? (
        <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-line bg-paper">{icon}</div>
      ) : null}
      <div>
        <div className="font-display text-2xl leading-none font-bold">{value}</div>
        <div className="mt-1 text-xs font-semibold tracking-wide text-ink-soft uppercase">{label}</div>
      </div>
    </div>
  );
}
