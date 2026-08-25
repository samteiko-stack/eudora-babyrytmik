import { cn } from '@/lib/cn';

interface ChoiceCardProps {
  selected?: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}

export function ChoiceCard({ selected, title, description, onClick }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full border-2 px-4 py-4 text-left transition-colors',
        selected
          ? 'border-field bg-field text-white'
          : 'border-field bg-surface text-ink hover:bg-bg-sage'
      )}
    >
      <span className="block text-base font-bold">{title}</span>
      {description && (
        <span className={cn('mt-1 block text-sm', selected ? 'text-white/80' : 'text-muted')}>
          {description}
        </span>
      )}
    </button>
  );
}
