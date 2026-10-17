import { TINT_SOLID, type Tint } from './card';
import { cn } from './cn';

export function ProgressBar({
  value,
  tint = 'mint',
  label,
  className,
  size = 'md',
}: {
  /** 0-100 */
  value: number;
  tint?: Tint;
  /** Accessible label, e.g. "Course progress" */
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'w-full overflow-hidden rounded-pill border-2 border-line bg-paper',
        size === 'sm' ? 'h-3' : 'h-4',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-pill border-r-2 border-line transition-[width] duration-500', TINT_SOLID[tint], v === 0 && 'border-r-0')}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
