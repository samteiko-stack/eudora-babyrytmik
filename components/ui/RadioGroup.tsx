import { cn } from '@/lib/cn';

interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioGroupProps<T extends string> {
  name: string;
  value?: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  error?: string;
}

export function RadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  error,
}: RadioGroupProps<T>) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-8">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3"
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors',
                  selected ? 'border-teal' : 'border-teal/80'
                )}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-teal" />}
              </span>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span>
                <span className="block text-sm text-ink">{option.label}</span>
                {option.description && (
                  <span className="block text-xs text-muted">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}
