'use client';

import { useActionState, useState } from 'react';
import { Card, Field, Input, Notice } from '@/components/ui';
import { SubmitButton } from '@/components/ui/submit-button';
import { savePrefs } from '../actions';
import type { DisplayMode } from '../schema';

const OPTIONS: { value: DisplayMode; label: string; note: string }[] = [
  { value: 'name', label: 'First name + initial', note: 'e.g. "Mia W."' },
  { value: 'nickname', label: 'A nickname', note: 'Only you and your teacher know it is you' },
  { value: 'hidden', label: 'Hide me', note: 'You still see your own rank; others do not see you' },
];

export function PrivacyForm({ displayMode, nickname }: { displayMode: DisplayMode; nickname: string | null }) {
  const [state, action] = useActionState(savePrefs, null);
  const [mode, setMode] = useState<DisplayMode>(displayMode);

  return (
    <Card className="p-5">
      <h3 className="text-lg font-bold">How you show up</h3>
      <p className="mb-4 text-sm text-ink-soft">Competition is more fun when it is your choice. Teachers always see real names.</p>
      <form action={action} className="flex flex-col gap-3">
        <fieldset className="grid gap-2 sm:grid-cols-3">
          <legend className="sr-only">Display mode</legend>
          {OPTIONS.map((o) => (
            <label key={o.value} className="flex cursor-pointer flex-col rounded-xl border-2 border-line bg-paper p-3 has-checked:bg-butter-soft has-checked:shadow-sticker-sm">
              <input type="radio" name="displayMode" value={o.value} checked={mode === o.value} onChange={() => setMode(o.value)} className="sr-only" />
              <span className="font-display font-semibold">{o.label}</span>
              <span className="text-xs text-ink-soft">{o.note}</span>
            </label>
          ))}
        </fieldset>
        {mode === 'nickname' ? (
          <Field label="Nickname" htmlFor="nickname">
            <Input id="nickname" name="nickname" defaultValue={nickname ?? ''} maxLength={24} placeholder="e.g. BugHunter" />
          </Field>
        ) : null}
        {state ? <Notice tone={state.ok ? 'success' : 'error'}>{state.ok ? state.message : state.error}</Notice> : null}
        <SubmitButton variant="secondary" size="sm" className="self-start" pendingText="Saving…">
          Save
        </SubmitButton>
      </form>
    </Card>
  );
}
