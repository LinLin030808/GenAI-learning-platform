'use client';
// One-button form for small mutations (remove a student, assign a course). Shows the
// pending state and any error inline, and can ask for confirmation first.

import { useActionState, type ReactNode } from 'react';
import type { ActionResult } from '@/core/types';
import type { ButtonVariant } from '@/components/ui';
import { SubmitButton } from '@/components/ui/submit-button';

export function InlineActionForm({
  action,
  fields,
  children,
  pendingText,
  confirmText,
  variant = 'secondary',
  ariaLabel,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  fields: Record<string, string>;
  children: ReactNode;
  pendingText: string;
  confirmText?: string;
  variant?: ButtonVariant;
  ariaLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className="inline-flex flex-col items-end gap-1"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton variant={variant} size="sm" pendingText={pendingText} aria-label={ariaLabel}>
        {children}
      </SubmitButton>
      {state && !state.ok ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
