import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div>
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/70',
            'transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/10',
            error ? 'border-error' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
