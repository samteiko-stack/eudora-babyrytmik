'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div>
        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={cn(
              'h-control-md w-full rounded-none border-2 bg-surface pl-4 pr-12 text-base text-ink placeholder:text-muted/70',
              'transition-colors focus:border-ink focus:outline-none',
              error ? 'border-error' : 'border-field',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute right-0 top-0 flex h-full items-center px-3 text-muted transition-colors hover:text-ink"
            aria-label={visible ? 'Dölj lösenord' : 'Visa lösenord'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
