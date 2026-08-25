import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<AlertVariant, string> = {
  error: 'border-error/40 bg-error-bg text-ink',
  success: 'border-field/40 bg-bg-sage text-ink',
  info: 'border-teal/30 bg-surface text-ink',
};

export function Alert({ variant = 'error', children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('border-2 px-4 py-3 text-base', variants[variant], className)}
    >
      {children}
    </div>
  );
}
