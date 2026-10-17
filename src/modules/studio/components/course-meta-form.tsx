'use client';

// Course details form in the editor: title, summary, subject, level, audience, tags, emoji, colour.
import { useState } from 'react';
import { Check } from 'lucide-react';
import { asTint, Button, cn, Field, Input, Notice, Select, Textarea, TINT_SOLID } from '@/components/ui';
import { updateCourseMeta } from '../actions';
import { useFormAction } from './use-form-action';

export interface CourseMetaValues {
  id: string;
  title: string;
  summary: string;
  subject: string;
  level: string;
  audience: string;
  tags: string[];
  emoji: string;
  color: string;
}

/** `colors` comes from COURSE_COLORS on the server (core/content/draft is server-only). */
export function CourseMetaForm({ course, colors }: { course: CourseMetaValues; colors: readonly string[] }) {
  const { state, pending, onSubmit } = useFormAction(updateCourseMeta);
  const [color, setColor] = useState(course.color);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="courseId" value={course.id} />
      {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
      {state?.ok && state.message ? <Notice tone="success">{state.message}</Notice> : null}

      <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
        <Field label="Title" htmlFor="meta-title">
          <Input id="meta-title" name="title" defaultValue={course.title} required minLength={3} maxLength={100} />
        </Field>
        <Field label="Emoji" htmlFor="meta-emoji">
          <Input id="meta-emoji" name="emoji" defaultValue={course.emoji} required maxLength={16} className="text-center text-xl" />
        </Field>
      </div>
      <Field label="Summary" htmlFor="meta-summary" hint="One or two sentences learners see on the course card.">
        <Textarea id="meta-summary" name="summary" defaultValue={course.summary} rows={2} maxLength={400} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Subject" htmlFor="meta-subject">
          <Input id="meta-subject" name="subject" defaultValue={course.subject} maxLength={60} />
        </Field>
        <Field label="Level" htmlFor="meta-level">
          <Select id="meta-level" name="level" defaultValue={course.level}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </Field>
        <Field label="Audience" htmlFor="meta-audience">
          <Select id="meta-audience" name="audience" defaultValue={course.audience}>
            <option value="everyone">Everyone</option>
            <option value="non_cs">Non-CS learners</option>
            <option value="cs">CS students and grads</option>
          </Select>
        </Field>
      </div>
      <Field label="Tags" htmlFor="meta-tags" hint="Separate with commas, up to 6.">
        <Input id="meta-tags" name="tags" defaultValue={course.tags.join(', ')} maxLength={400} />
      </Field>

      <fieldset>
        <legend className="mb-1.5 font-display text-sm font-semibold">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c}
                checked={color === c}
                onChange={() => setColor(c)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-full border-2 border-line shadow-sticker-sm',
                  'peer-focus-visible:ring-4 peer-focus-visible:ring-sky/50',
                  TINT_SOLID[asTint(c)],
                )}
              >
                {color === c ? <Check className="h-5 w-5" aria-hidden /> : null}
              </span>
              <span className="sr-only">{c}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Button type="submit" variant="mint" disabled={pending} aria-busy={pending}>
          {pending ? 'Saving…' : 'Save details'}
        </Button>
      </div>
    </form>
  );
}
