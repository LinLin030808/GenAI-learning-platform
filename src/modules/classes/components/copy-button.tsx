'use client';
// Copies a string to the clipboard and confirms it in place (announced to screen readers).

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, type ButtonVariant } from '@/components/ui';

export function CopyButton({
  value,
  label,
  copiedLabel = 'Copied',
  variant = 'secondary',
}: {
  value: string;
  label: string;
  copiedLabel?: string;
  variant?: ButtonVariant;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant={variant} size="sm" onClick={copy}>
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? copiedLabel : label}
      </Button>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
      {failed ? <span className="text-xs font-semibold text-danger">Copy failed. Select the text instead.</span> : null}
    </span>
  );
}
