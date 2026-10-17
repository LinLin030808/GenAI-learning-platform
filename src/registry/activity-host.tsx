'use client';

// Renders any registered activity type from its DB row. Used by the lesson player
// (courses module) and the studio preview, so neither needs to know activity internals.
import type { ActivityCompletion, ActivityOutcome } from '@/core/activity-types';
import { Card, Notice } from '@/components/ui';
import { getActivityType } from './activities';

export interface ActivityHostProps {
  activity: { id: string; type: string; title: string; xpReward: number; config: unknown };
  /** Omit in preview mode */
  onComplete?: (result: ActivityCompletion) => Promise<ActivityOutcome | null>;
  previousBest?: number | null;
  preview?: boolean;
}

const noop = async () => null;

export function ActivityHost({ activity, onComplete, previousBest, preview }: ActivityHostProps) {
  const def = getActivityType(activity.type);
  if (!def) {
    return (
      <Card className="p-5">
        <Notice tone="error">Unknown activity type “{activity.type}”. Is its module registered?</Notice>
      </Card>
    );
  }
  const parsed = def.schema.safeParse(activity.config);
  if (!parsed.success) {
    return (
      <Card className="p-5">
        <Notice tone="error">This {def.label.toLowerCase()} has an invalid setup. An instructor needs to fix it in the studio.</Notice>
      </Card>
    );
  }
  const { Player } = def;
  return (
    <Player
      activity={{ id: activity.id, title: activity.title, xpReward: activity.xpReward }}
      config={parsed.data}
      onComplete={preview || !onComplete ? noop : onComplete}
      previousBest={previousBest ?? null}
      preview={preview}
    />
  );
}
