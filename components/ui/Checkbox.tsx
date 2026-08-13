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
              'mt-0.5 h-4 w-4 shrink-0 rounded-none border border-field text-field focus:ring-0',
              className
            )}
            {...props}
          />
          <span className="text-sm text-ink">{label}</span>
        </label>
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
