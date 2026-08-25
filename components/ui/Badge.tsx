import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-none bg-accent px-4 py-2 text-sm text-teal',
        className
      )}
    >
      {children}
    </div>
  );
}
