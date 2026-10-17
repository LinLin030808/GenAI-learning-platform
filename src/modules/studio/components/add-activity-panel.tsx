'use client';

// "Add an activity" menu, built from the activity registry: any registered type can be added
// blank (its defaultConfig) or written by AI from the lesson text.
import { useState } from 'react';
import { Plus, WandSparkles } from 'lucide-react';
import type { ActivityDefinition } from '@/core/activity-types';
import { Button, Card, CardBody, CardHeader, EmptyState, Field, Input, Notice } from '@/components/ui';
import { ACTIVITY_TYPES } from '@/registry/activities';
import { addActivity } from '../actions';
import { useFormAction } from './use-form-action';

function TypeCard({ def, lessonId, note }: { def: ActivityDefinition; lessonId: string; note: string }) {
  const { state, pending, onSubmit } = useFormAction(addActivity);
  const [mode, setMode] = useState<'blank' | 'ai'>('blank');
  const Icon = def.icon;
  return (
    <li className="flex flex-col gap-2 rounded-xl border-2 border-line bg-paper p-3">
      <div className="flex items-start gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-line bg-lilac-soft">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display font-bold">{def.label}</p>
          <p className="text-sm text-ink-soft">{def.description}</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mt-auto flex flex-wrap gap-2">
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="type" value={def.type} />
        <input type="hidden" name="note" value={note} />
        {/* mode comes from the clicked button (useFormAction passes the submitter to FormData) */}
        <Button
          type="submit"
          name="mode"
          value="blank"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => setMode('blank')}
          aria-label={`Add a blank ${def.label}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {pending && mode === 'blank' ? 'Adding…' : 'Add blank'}
        </Button>
        <Button
          type="submit"
          name="mode"
          value="ai"
          size="sm"
          variant="mint"
          disabled={pending}
          onClick={() => setMode('ai')}
          aria-label={`Generate a ${def.label} with AI`}
        >
          <WandSparkles className="h-4 w-4" aria-hidden />
          {pending && mode === 'ai' ? 'Pip is writing…' : 'Generate with AI'}
        </Button>
      </form>
      {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
      {state?.ok && state.message ? <Notice tone="success">{state.message}</Notice> : null}
    </li>
  );
}

export function AddActivityPanel({ lessonId }: { lessonId: string }) {
  const [note, setNote] = useState('');
  return (
    <Card tint="lilac">
      <CardHeader
        title="Add an activity"
        subtitle="Start blank and fill in the setup, or let Pip write one from this lesson’s text."
      />
      <CardBody className="flex flex-col gap-4">
        {ACTIVITY_TYPES.length === 0 ? (
          <EmptyState title="No activity types installed">
            Activity types are added in the activities registry. Once they are, they show up here.
          </EmptyState>
        ) : (
          <>
            <Field
              label="Note for Pip"
              htmlFor="activity-note"
              hint="Optional, used by “Generate with AI”. e.g. “focus on the difference between bugs and features”."
            >
              <Input id="activity-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <ul className="grid gap-3 sm:grid-cols-2">
              {ACTIVITY_TYPES.map((def) => (
                <TypeCard key={def.type} def={def} lessonId={lessonId} note={note} />
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}
