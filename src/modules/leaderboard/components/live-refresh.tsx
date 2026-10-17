'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Re-fetches the board every 30s while the tab is visible, so it feels live in class. */
export function LiveRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState<string>('');

  useEffect(() => {
    // Time is only shown after the first refresh, so server and client render the same HTML
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh();
        setUpdatedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft" aria-live="off">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-line bg-mint" />
      </span>
      Live{updatedAt ? ` · updated ${updatedAt}` : ''}
    </span>
  );
}
