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
        'flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
        active ? 'bg-teal text-white shadow-sm' : 'text-muted hover:bg-bg-sage hover:text-ink',
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span className={cn('ml-auto rounded-full px-2 py-0.5 text-xs', active ? 'bg-white/15 text-white' : 'bg-bg-sage text-ink')}>
          {count}
        </span>
      )}
    </button>
  );
}
