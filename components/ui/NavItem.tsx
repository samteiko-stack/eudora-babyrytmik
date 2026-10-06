import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
  count?: number;
}

export function NavItem({ active, icon, count, children, className, ...props }: NavItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] lg:min-h-11 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-left lg:text-sm',
        active ? 'bg-teal text-white shadow-sm' : 'text-muted hover:bg-bg-sage hover:text-ink',
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span className={cn('hidden rounded-full px-2 py-0.5 text-xs lg:ml-auto lg:inline-flex', active ? 'bg-white/15 text-white' : 'bg-bg-sage text-ink')}>
          {count}
        </span>
      )}
    </button>
  );
}
