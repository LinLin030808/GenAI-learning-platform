'use client';
// "New class" form for staff and "Join with a code" form for learners.

import { useActionState } from 'react';
import { Field, Input, Notice, Textarea } from '@/components/ui';
import { SubmitButton } from '@/components/ui/submit-button';
import { createClass, joinClass } from '../actions';

export function CreateClassForm() {
  const [state, action] = useActionState(createClass, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state ? <Notice tone={state.ok ? 'success' : 'error'}>{state.ok ? state.message : state.error}</Notice> : null}
      <Field label="Class name" htmlFor="class-name">
        <Input id="class-name" name="name" required maxLength={80} placeholder="COMP7503 Group A" />
      </Field>
      <Field label="Description" htmlFor="class-description" hint="Optional. Students see this.">
        <Textarea
          id="class-description"
          name="description"
          maxLength={300}
          rows={3}
          placeholder="Thursday evening section, software engineering basics."
        />
      </Field>
      <SubmitButton pendingText="Creating…" className="self-start">
        Create class
      </SubmitButton>
    </form>
  );
}

export function JoinClassForm() {
  const [state, action] = useActionState(joinClass, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state ? <Notice tone={state.ok ? 'success' : 'error'}>{state.ok ? state.message : state.error}</Notice> : null}
      <Field label="Invite code" htmlFor="invite-code" hint="Your teacher gives you a 6-character code.">
        <Input
          id="invite-code"
          name="code"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={9}
          placeholder="ABC234"
          className="font-mono tracking-[0.3em] uppercase"
        />
      </Field>
      <SubmitButton pendingText="Joining…" className="self-start">
        Join class
      </SubmitButton>
    </form>
  );
}
