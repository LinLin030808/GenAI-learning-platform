'use client';

// Shared chrome for every activity player: header, body, and the result screen.
import { RotateCcw, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ActivityOutcome } from '@/core/activity-types';
import { Badge, Button, Card, Notice, Pip, type Tint } from '@/components/ui';

export function ActivityFrame({
  kind,
  title,
  xpReward,
  previousBest,
  preview,
  tint = 'paper',
  children,
}: {
  kind: string;
  title: string;
  xpReward: number;
  previousBest?: number | null;
  preview?: boolean;
  tint?: Tint;
  children: ReactNode;
}) {
  return (
    <Card tint={tint} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-line bg-paper px-5 py-3">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-wide text-ink-soft uppercase">{kind}</div>
          <h3 className="truncate text-lg font-bold">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {preview ? <Badge tint="sky">Preview</Badge> : null}
          {previousBest != null ? <Badge tint="mint">Best {previousBest}%</Badge> : null}
          <Badge tint="butter">
            <Zap className="h-3.5 w-3.5" /> {xpReward} XP
          </Badge>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function moodFor(score: number) {
  if (score >= 90) return 'cheer' as const;
  if (score >= 60) return 'happy' as const;
  return 'think' as const;
}

function headline(score: number) {
  if (score >= 100) return 'Perfect. Pip is doing a little dance.';
  if (score >= 80) return 'Really solid work.';
  if (score >= 60) return 'Nice, you got the main idea.';
  if (score >= 30) return 'Getting there. One more go?';
  return 'Tricky one. Have another look and try again.';
}

export function ResultPanel({
  score,
  outcome,
  submitting,
  error,
  preview,
  onRetry,
  children,
}: {
  score: number;
  outcome: ActivityOutcome | null;
  submitting: boolean;
  error: string | null;
  preview?: boolean;
  onRetry?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="animate-pop flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Pip mood={moodFor(score)} size={76} />
        <div>
          <div className="font-display text-4xl font-bold">{score}%</div>
          <p className="font-semibold">{headline(score)}</p>
          {submitting ? <p className="text-sm text-ink-soft">Saving your result…</p> : null}
          {preview ? <p className="text-sm text-ink-soft">Preview mode: nothing is saved.</p> : null}
        </div>
      </div>

      {outcome ? (
        <div className="flex flex-wrap gap-2" aria-live="polite">
          <Badge tint="butter">
            <Zap className="h-3.5 w-3.5" /> {outcome.xpGained > 0 ? `+${outcome.xpGained} XP` : 'No new XP (beat your best to earn more)'}
          </Badge>
          {outcome.leveledUp ? <Badge tint="mint">Level up! You are now a {outcome.levelName}</Badge> : null}
          {outcome.lessonCompleted ? <Badge tint="sky">Lesson complete</Badge> : null}
          {outcome.courseCompleted ? <Badge tint="coral">Course complete 🎉</Badge> : null}
        </div>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      {children}

      {onRetry ? (
        <div>
          <Button variant="secondary" onClick={onRetry} disabled={submitting}>
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
