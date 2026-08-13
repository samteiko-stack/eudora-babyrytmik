import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Label } from './Label';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, required, className, children }: FieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
    </div>
  );
}
