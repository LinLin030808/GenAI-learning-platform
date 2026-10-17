'use client';

// A one-button form for small studio actions (move, delete, publish, duplicate).
import type { ReactNode } from 'react';
import { Button, cn, type ButtonVariant } from '@/components/ui';
import { useFormAction, type FormAction } from './use-form-action';

export function ActionButton({
  action,
  fields,
  children,
  pendingText,
  variant = 'secondary',
  size = 'sm',
  confirmText,
  ariaLabel,
  disabled,
  showMessage,
  className,
}: {
  action: FormAction;
  fields: Record<string, string>;
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  /** Ask before running (e.g. deleting) */
  confirmText?: string;
  /** Required when the button only shows an icon */
  ariaLabel?: string;
  disabled?: boolean;
  /** Also show the success message (errors are always shown) */
  showMessage?: boolean;
  className?: string;
}) {
  const { state, pending, onSubmit } = useFormAction(action);
  return (
    <form
      className={cn('inline-flex flex-col items-start gap-1', className)}
      onSubmit={(event) => {
        if (confirmText && !window.confirm(confirmText)) {
          event.preventDefault();
          return;
        }
        onSubmit(event);
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={disabled || pending}
        aria-busy={pending}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {pending && pendingText ? pendingText : children}
      </Button>
      {state && !state.ok ? (
        <p role="alert" className="max-w-xs text-sm font-semibold text-danger">
          {state.error}
        </p>
      ) : null}
      {showMessage && state?.ok && state.message ? (
        <p role="status" className="max-w-xs text-sm font-semibold text-mint-deep">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
