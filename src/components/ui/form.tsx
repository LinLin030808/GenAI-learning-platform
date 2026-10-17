import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

const fieldBase =
  'w-full rounded-xl border-2 border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/70 ' +
  'shadow-[inset_0_2px_0_0_rgba(43,34,64,0.06)] focus:outline-none focus:ring-4 focus:ring-sky/50 ' +
  'disabled:opacity-60';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-24 leading-relaxed', className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, 'h-10 pr-8', className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('font-display text-sm font-semibold', className)} {...props} />;
}

/** Label + control + optional hint / error, stacked. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

/** Inline notice for form results. */
export function Notice({
  tone = 'info',
  children,
  className,
}: {
  tone?: 'info' | 'success' | 'error';
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: 'bg-sky-soft',
    success: 'bg-mint-soft',
    error: 'bg-coral-soft text-coral-deep',
  };
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-xl border-2 border-line px-3 py-2 text-sm font-semibold', tones[tone], className)}
    >
      {children}
    </div>
  );
}
