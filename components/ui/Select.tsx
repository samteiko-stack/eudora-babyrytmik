import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function Select({
  value,
  placeholder = 'Välj',
  options,
  onChange,
  error,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center justify-between rounded-md border bg-surface px-4 py-3 text-left text-sm transition-colors',
            'focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/10',
            error ? 'border-error' : 'border-border'
          )}
        >
          <span className={selected ? 'text-ink' : 'text-muted'}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-surface shadow-dropdown">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-bg-sage',
                  option.value === value
                    ? 'bg-bg-sage font-medium text-teal'
                    : 'text-ink'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}
