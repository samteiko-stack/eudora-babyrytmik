import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'session' | 'week' | 'muted' | 'error' | 'count';
type BadgeSize = 'md' | 'sm';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'border border-teal/20 bg-accent text-teal',
  session: 'border border-teal/30 bg-accent text-teal',
  week: 'border border-ink/10 bg-bg-sage text-ink',
  muted: 'border border-ink/10 bg-bg-sage text-muted',
  error: 'border border-error/20 bg-error-bg text-error',
  count: 'border border-teal/30 bg-teal text-white',
};

const sizes: Record<BadgeSize, string> = {
  md: 'px-3 py-1.5 text-base',
  sm: 'px-2.5 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none font-medium leading-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
