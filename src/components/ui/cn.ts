import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes; later classes win (cn('p-2', cond && 'p-4')). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
