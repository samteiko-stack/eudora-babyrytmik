import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded-none border-2 border-field',
              'text-ink accent-ink focus:ring-0 focus:ring-offset-0',
              className
            )}
            {...props}
          />
          <span className="text-base text-ink">{label}</span>
        </label>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
