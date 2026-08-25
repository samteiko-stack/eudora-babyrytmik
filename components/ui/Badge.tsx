import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'error';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-accent text-teal',
  error: 'bg-error-bg text-error',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-none px-4 py-2 text-base',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
