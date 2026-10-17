'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signup } from '@/core/auth/actions';
import { Card, Field, Input, Notice } from '@/components/ui';
import { SubmitButton } from '@/components/ui/submit-button';

export default function SignupPage() {
  const [state, action] = useActionState(signup, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold">Plant your seed</h1>
      <p className="mt-1 text-ink-soft">Takes less than a minute.</p>
      <form action={action} className="mt-5 flex flex-col gap-4">
        {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
        <Field label="Your name" htmlFor="name" error={errors.name}>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters.">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-display text-sm font-semibold">I am joining as</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'learner', label: 'A learner', note: 'I want to learn' },
              { value: 'instructor', label: 'An instructor', note: 'I teach a class' },
            ].map((r, i) => (
              <label
                key={r.value}
                className="flex cursor-pointer flex-col rounded-xl border-2 border-line bg-paper p-3 has-checked:bg-mint-soft has-checked:shadow-sticker-sm"
              >
                <input type="radio" name="role" value={r.value} defaultChecked={i === 0} className="sr-only" />
                <span className="font-display font-semibold">{r.label}</span>
                <span className="text-sm text-ink-soft">{r.note}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <SubmitButton pendingText="Planting…" className="mt-1">
          Create account
        </SubmitButton>
      </form>
      <p className="mt-5 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-coral-deep underline underline-offset-2">
          Log in
        </Link>
      </p>
    </Card>
  );
}
