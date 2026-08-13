import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('mb-2 block text-sm font-semibold text-ink', className)}
      {...props}
    >
      {children}
      {required && <span className="text-error"> *</span>}
    </label>
  );
}
