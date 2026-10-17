'use client';

// Topic form for "Learn anything". Runs the action from onSubmit (not <form action>) so the
// typed topic survives an error such as the daily limit.
import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { WandSparkles } from 'lucide-react';
import type { ActionResult } from '@/core/types';
import { Button, Card, Field, Input, Notice, PipSays, Select } from '@/components/ui';
import { generateLearnerCourse } from '../actions';

const EXAMPLES = [
  'How the stock market works',
  'Basics of photography',
  'Git for beginners',
  'Ancient Rome in 5 lessons',
  'How vaccines train your immune system',
  'Writing a clear cover letter',
];

export function LearnForm({ remaining, limit }: { remaining: number; limit: number }) {
  const [state, dispatch, pending] = useActionState<ActionResult | null, FormData>(generateLearnerCourse, null);
  const [topic, setTopic] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" aria-busy={pending}>
        {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
        <Field label="What do you want to learn?" htmlFor="topic">
          <Input
            id="topic"
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. How the stock market works"
            required
            minLength={3}
            maxLength={200}
            disabled={pending}
            className="h-12 text-lg"
          />
        </Field>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Example topics">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              disabled={pending}
              aria-pressed={topic === example}
              onClick={() => setTopic(example)}
              className="rounded-pill border-2 border-line bg-butter-soft px-3 py-1 text-sm font-semibold hover:bg-butter disabled:opacity-60"
            >
              {example}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <Field label="Why do you want to learn this?" htmlFor="why" hint="Optional. Pip picks examples that fit.">
            <Input
              id="why"
              name="why"
              maxLength={300}
              placeholder="e.g. I start an internship at a bank next month"
              disabled={pending}
            />
          </Field>
          <Field label="Your level" htmlFor="level">
            <Select id="level" name="level" defaultValue="beginner" disabled={pending}>
              <option value="beginner">New to it</option>
              <option value="intermediate">Know the basics</option>
              <option value="advanced">Fairly confident</option>
            </Select>
          </Field>
        </div>

        {pending ? (
          <PipSays mood="think" size={64}>
            <p className="font-display font-bold">Pip is writing your course… ~30s</p>
            <p className="text-sm text-ink-soft">Short lessons plus a few activities. You will land on it when it is ready.</p>
          </PipSays>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={pending || remaining <= 0} aria-busy={pending}>
            <WandSparkles className="h-4 w-4" aria-hidden />
            {pending ? 'Writing your course…' : 'Make my course'}
          </Button>
          <p className="text-sm text-ink-soft">
            {remaining > 0
              ? `${remaining} of ${limit} new courses left today.`
              : `That is ${limit} courses today. Pip can make more tomorrow.`}
          </p>
        </div>
      </form>
    </Card>
  );
}
