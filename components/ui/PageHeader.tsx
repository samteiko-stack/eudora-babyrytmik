import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-field">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-bold leading-tight text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-muted">{description}</p>}
      </div>
      {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">{actions}</div>}
    </header>
  );
}
