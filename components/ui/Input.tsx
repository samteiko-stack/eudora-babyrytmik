import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  compact?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, compact = false, ...props }, ref) => {
    return (
      <div>
        <input
          ref={ref}
          className={cn(
            'w-full rounded-none border-2 bg-surface text-base text-ink placeholder:text-muted/70',
            compact ? 'h-control-sm px-3' : 'h-control-md px-4',
            'transition-colors focus:border-ink focus:outline-none',
            error ? 'border-error' : 'border-field',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
