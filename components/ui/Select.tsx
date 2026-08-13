import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const [menuMaxHeight, setMenuMaxHeight] = useState(256);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useLayoutEffect(() => {
    if (!open || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const preferred = 256;

    if (spaceBelow < 160 && spaceAbove > spaceBelow) {
      setPlacement('top');
      setMenuMaxHeight(Math.max(120, Math.min(preferred, spaceAbove)));
    } else {
      setPlacement('bottom');
      setMenuMaxHeight(Math.max(120, Math.min(preferred, spaceBelow)));
    }
  }, [open]);

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
            'flex w-full items-center justify-between rounded-none border-2 bg-surface px-4 py-3 text-left text-sm transition-colors',
            'focus:border-field focus:outline-none',
            error ? 'border-error' : 'border-field'
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
          <div
            className={cn(
              'absolute z-30 w-full overflow-y-auto border-2 border-field bg-surface shadow-dropdown',
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            )}
            style={{ maxHeight: menuMaxHeight }}
          >
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
