'use client';

// Lesson text editor: title, minutes, Markdown with live preview, and the "AI rewrite" box.
// AI rewrites are shown side by side and only replace the text when the instructor accepts.
import { useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, cn, Field, Input, Markdown, Notice, Textarea } from '@/components/ui';
import { rewriteLesson, updateLesson } from '../actions';
import { REWRITE_PRESETS } from '../prompts';
import { useFormAction } from './use-form-action';

interface LessonValues {
  id: string;
  title: string;
  estimatedMinutes: number;
  content: string;
}

function RewriteBox({
  lessonId,
  content,
  onAccept,
}: {
  lessonId: string;
  content: string;
  onAccept: (markdown: string) => void;
}) {
  const { state, pending, onSubmit } = useFormAction(rewriteLesson);
  const [instruction, setInstruction] = useState('');
  // The result object we already accepted or discarded, so it does not show again
  const [handled, setHandled] = useState<unknown>(null);
  const result = state?.ok && state !== handled ? state : null;

  return (
    <Card tint="lilac">
      <CardHeader title="AI rewrite" subtitle="Pip rewrites the current text. Nothing changes until you use it." />
      <CardBody className="flex flex-col gap-3">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input type="hidden" name="lessonId" value={lessonId} />
          <input type="hidden" name="content" value={content} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Rewrite presets">
            {REWRITE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={instruction === p.instruction}
                onClick={() => setInstruction(p.instruction)}
                className={cn(
                  'rounded-pill border-2 border-line px-3 py-1 text-sm font-semibold',
                  instruction === p.instruction ? 'bg-butter' : 'bg-paper hover:bg-butter-soft',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Field label="Instruction" htmlFor="rewrite-instruction" hint="Pick a preset above or write your own.">
            <Textarea
              id="rewrite-instruction"
              name="instruction"
              rows={2}
              maxLength={500}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Use an example from a coffee shop"
            />
          </Field>
          {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
          <div>
            <Button type="submit" variant="secondary" disabled={pending} aria-busy={pending}>
              <WandSparkles className="h-4 w-4" aria-hidden />
              {pending ? 'Pip is rewriting…' : 'Rewrite with AI'}
            </Button>
          </div>
        </form>

        {result?.data ? (
          <div className="flex flex-col gap-3 rounded-xl border-2 border-line bg-paper p-3">
            {result.message ? <Notice>{result.message}</Notice> : null}
            <div className="max-h-96 overflow-y-auto pr-1">
              <Markdown>{result.data.content}</Markdown>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="mint"
                onClick={() => {
                  if (result.data) onAccept(result.data.content);
                  setHandled(result);
                }}
              >
                Use this version
              </Button>
              <Button variant="ghost" onClick={() => setHandled(result)}>
                Discard
              </Button>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function LessonEditor({ lesson }: { lesson: LessonValues }) {
  const { state, pending, onSubmit } = useFormAction(updateLesson);
  const [content, setContent] = useState(lesson.content);
  const [accepted, setAccepted] = useState(false);
  const isDirty = content !== lesson.content;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Lesson text"
          subtitle="Markdown works: ## headings, **bold**, lists, tables and code."
          action={isDirty ? <Badge tint="butter">Unsaved changes</Badge> : null}
        />
        <CardBody>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="lessonId" value={lesson.id} />
            {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
            {state?.ok && state.message && !isDirty ? <Notice tone="success">{state.message}</Notice> : null}
            {accepted && isDirty ? (
              <Notice>Pip’s version is in the editor. Save the lesson to keep it.</Notice>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <Field label="Title" htmlFor="lesson-title">
                <Input id="lesson-title" name="title" defaultValue={lesson.title} required maxLength={120} />
              </Field>
              <Field label="Minutes" htmlFor="lesson-minutes">
                <Input
                  id="lesson-minutes"
                  name="estimatedMinutes"
                  type="number"
                  min={1}
                  max={120}
                  defaultValue={lesson.estimatedMinutes}
                  required
                />
              </Field>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Field label="Content (Markdown)" htmlFor="lesson-content">
                <Textarea
                  id="lesson-content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={18}
                  maxLength={40000}
                  className="font-mono text-sm"
                />
              </Field>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="font-display text-sm font-semibold" id="lesson-preview-label">
                  Preview
                </span>
                <div
                  aria-labelledby="lesson-preview-label"
                  className="max-h-[32rem] min-h-24 overflow-y-auto rounded-xl border-2 border-dashed border-line/50 bg-cream px-4 py-3"
                >
                  {content.trim() ? (
                    <Markdown>{content}</Markdown>
                  ) : (
                    <p className="text-ink-soft">Start typing and the preview shows up here.</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Button type="submit" variant="mint" disabled={pending} aria-busy={pending}>
                {pending ? 'Saving…' : 'Save lesson'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <RewriteBox
        lessonId={lesson.id}
        content={content}
        onAccept={(markdown) => {
          setContent(markdown);
          setAccepted(true);
        }}
      />
    </div>
  );
}
