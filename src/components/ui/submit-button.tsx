'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from './button';

/** Submit button that disables itself and shows `pendingText` while the form action runs. */
export function SubmitButton({
  children,
  pendingText = 'Working…',
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
