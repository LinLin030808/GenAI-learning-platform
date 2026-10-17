'use client';

// Plays a lesson's activities in order and saves results through a server action.
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { ActivityCompletion } from '@/core/activity-types';
import { ActivityHost } from '@/registry/activity-host';
import { submitActivityResult } from '../actions';

export interface RunnerActivity {
  id: string;
  type: string;
  title: string;
  xpReward: number;
  config: unknown;
  bestScore: number | null;
}

export function LessonRunner({ activities }: { activities: RunnerActivity[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      {activities.map((a) => (
        <ActivityHost
          key={a.id}
          activity={a}
          previousBest={a.bestScore}
          onComplete={async (result: ActivityCompletion) => {
            const outcome = await submitActivityResult({ activityId: a.id, score: result.score, detail: result.detail });
            // Refresh server components (XP badge, lesson ticks) without losing player state
            startTransition(() => router.refresh());
            return outcome;
          }}
        />
      ))}
    </div>
  );
}
