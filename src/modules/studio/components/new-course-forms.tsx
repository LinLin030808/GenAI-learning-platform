'use client';

// /studio/new: generate a course with AI, or start a blank one. Two tabs, one page.
import { useState } from 'react';
import { WandSparkles, FilePlus2 } from 'lucide-react';
import { Button, Card, cn, Field, Input, Notice, PipSays, Select, Textarea } from '@/components/ui';
import { ACTIVITY_TYPES } from '@/registry/activities';
import { createBlankCourse, generateCourse } from '../actions';
import { useFormAction } from './use-form-action';

type Mode = 'ai' | 'blank';

/** Types ticked by default when they exist in the registry. */
const PREFERRED_TYPES = ['quiz', 'sort'];

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function GenerateForm() {
  const { state, pending, onSubmit } = useFormAction(generateCourse);
  const preferred = ACTIVITY_TYPES.filter((d) => PREFERRED_TYPES.includes(d.type)).map((d) => d.type);
  const defaults = new Set(preferred.length ? preferred : ACTIVITY_TYPES.map((d) => d.type));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" aria-busy={pending}>
      {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Topic" htmlFor="topic" hint="One sentence is enough, e.g. “Writing user stories for a mobile app”.">
        <Input id="topic" name="topic" required minLength={3} maxLength={200} disabled={pending} />
      </Field>
      <Field
        label="Who are the learners?"
        htmlFor="audienceNote"
        hint="Optional. e.g. “first-year business students who have never coded”."
      >
        <Input id="audienceNote" name="audienceNote" maxLength={300} disabled={pending} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Level" htmlFor="level">
          <Select id="level" name="level" defaultValue="beginner" disabled={pending}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Number of lessons" htmlFor="lessonCount">
          <Select id="lessonCount" name="lessonCount" defaultValue="3" disabled={pending}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-1.5 font-display text-sm font-semibold">Activity types to use</legend>
        {ACTIVITY_TYPES.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No activity types are installed yet, so the lessons will be reading only.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {ACTIVITY_TYPES.map((def) => {
              const Icon = def.icon;
              return (
                <label
                  key={def.type}
                  className="flex cursor-pointer items-start gap-2.5 rounded-xl border-2 border-line bg-paper px-3 py-2 has-[:checked]:bg-mint-soft"
                >
                  <input
                    type="checkbox"
                    name="types"
                    value={def.type}
                    defaultChecked={defaults.has(def.type)}
                    className="mt-1 h-4 w-4 accent-mint-deep"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Icon className="h-4 w-4" aria-hidden /> {def.label}
                    </span>
                    <span className="block text-sm text-ink-soft">{def.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <Field
        label="Teaching material"
        htmlFor="materials"
        hint="Optional. Paste notes, a lecture outline or an article and Pip builds the course from it."
      >
        <Textarea id="materials" name="materials" rows={5} maxLength={20000} disabled={pending} />
      </Field>
      <Field
        label="Anything else?"
        htmlFor="requirements"
        hint="Optional. e.g. “include a role-play with a client” or “use examples from banking”."
      >
        <Textarea id="requirements" name="requirements" rows={2} maxLength={1000} disabled={pending} />
      </Field>

      {pending ? (
        <PipSays mood="think" size={64}>
          <p className="font-display font-bold">Pip is writing your course… ~30s</p>
          <p className="text-sm text-ink-soft">Lessons first, then the activities. Keep this tab open.</p>
        </PipSays>
      ) : null}
      <div>
        <Button type="submit" variant="primary" disabled={pending} aria-busy={pending}>
          <WandSparkles className="h-4 w-4" aria-hidden />
          {pending ? 'Writing your course…' : 'Generate course'}
        </Button>
      </div>
    </form>
  );
}

function BlankForm() {
  const { state, pending, onSubmit } = useFormAction(createBlankCourse);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Course title" htmlFor="title">
        <Input id="title" name="title" required minLength={3} maxLength={100} disabled={pending} />
      </Field>
      <Field label="Subject" htmlFor="subject" hint="e.g. Software Engineering, History, Biology">
        <Input id="subject" name="subject" maxLength={60} disabled={pending} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Level" htmlFor="blank-level">
          <Select id="blank-level" name="level" defaultValue="beginner" disabled={pending}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Audience" htmlFor="audience">
          <Select id="audience" name="audience" defaultValue="everyone" disabled={pending}>
            <option value="everyone">Everyone</option>
            <option value="non_cs">Non-CS learners</option>
            <option value="cs">CS students and grads</option>
          </Select>
        </Field>
      </div>
      <div>
        <Button type="submit" variant="primary" disabled={pending} aria-busy={pending}>
          <FilePlus2 className="h-4 w-4" aria-hidden />
          {pending ? 'Creating…' : 'Create course'}
        </Button>
      </div>
    </form>
  );
}

export function NewCourseForms({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const tabs: { id: Mode; label: string }[] = [
    { id: 'ai', label: 'Generate with AI' },
    { id: 'blank', label: 'Blank course' },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <div role="tablist" aria-label="How to start" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={mode === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setMode(t.id)}
            className={cn(
              'rounded-pill border-2 border-line px-4 py-1.5 font-display font-semibold',
              mode === t.id ? 'bg-butter shadow-sticker-sm' : 'bg-paper hover:bg-butter-soft',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card className="p-5 sm:p-6">
        <div id={`panel-${mode}`} role="tabpanel" aria-labelledby={`tab-${mode}`}>
          {mode === 'ai' ? <GenerateForm /> : <BlankForm />}
        </div>
      </Card>
    </div>
  );
}
