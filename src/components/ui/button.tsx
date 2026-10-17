import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'mint' | 'butter' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-coral text-ink hover:bg-coral-deep hover:text-paper',
  secondary: 'bg-paper text-ink hover:bg-butter-soft',
  mint: 'bg-mint text-ink hover:bg-mint-deep hover:text-paper',
  butter: 'bg-butter text-ink hover:brightness-95',
  ghost: 'border-transparent bg-transparent shadow-none hover:bg-ink/5 active:translate-0',
  danger: 'bg-paper text-danger hover:bg-coral-soft',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-[0.95rem] gap-2',
  lg: 'h-12 px-6 text-lg gap-2.5',
};

/** Class string for anything that should look like a button (e.g. <Link>). */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center rounded-pill border-2 border-line font-display font-semibold',
    'shadow-sticker-sm transition-[transform,box-shadow,background-color] duration-150',
    'hover:-translate-y-0.5 hover:shadow-sticker active:translate-y-0.5 active:shadow-none',
    'disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
