// Deterministic "blob buddy" avatar generated from a seed string. No uploads needed and
// every user looks different on the leaderboard.
import { cn } from './cn';

const FILLS = ['#FF8A7A', '#7FD8BE', '#FFD166', '#8ECBFF', '#C9B6FF', '#FFB38A', '#9BE3A0'];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function Avatar({
  seed,
  name,
  size = 40,
  className,
}: {
  seed: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const h = hash(seed);
  const fill = FILLS[h % FILLS.length];
  const shape = (h >> 3) % 3;
  const eyeY = 44 + ((h >> 5) % 6);
  const smile = (h >> 8) % 2 === 0;
  const body =
    shape === 0
      ? 'M50 10 C80 10 92 34 90 56 C88 80 72 92 50 92 C28 92 10 80 10 56 C10 32 22 10 50 10 Z'
      : shape === 1
        ? 'M50 8 C72 12 92 26 90 52 C88 78 76 92 50 92 C24 92 10 78 10 52 C10 28 28 6 50 8 Z'
        : 'M50 12 C76 6 94 30 88 56 C84 80 70 94 48 92 C24 90 8 76 12 52 C16 28 28 16 50 12 Z';
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${name}'s avatar`}
      className={cn('shrink-0', className)}
    >
      <path d={body} fill={fill} stroke="#2B2240" strokeWidth="5" />
      <circle cx="38" cy={eyeY} r="5.5" fill="#2B2240" />
      <circle cx="62" cy={eyeY} r="5.5" fill="#2B2240" />
      {smile ? (
        <path d={`M40 ${eyeY + 16} Q50 ${eyeY + 25} 60 ${eyeY + 16}`} stroke="#2B2240" strokeWidth="5" fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx="50" cy={eyeY + 19} rx="5" ry="4" fill="#2B2240" />
      )}
    </svg>
  );
}
