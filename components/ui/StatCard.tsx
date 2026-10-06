import type { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, detail, icon }: StatCardProps) {
  return (
    <Card padding="lg" className="relative overflow-hidden">
      {icon && (
        <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-bg-sage text-teal">
          {icon}
        </div>
      )}
      <p className="pr-12 text-sm font-medium text-muted">{label}</p>
      <p className="mt-3 text-5xl font-bold leading-none text-ink">{value}</p>
      {detail && <p className="mt-3 text-sm text-muted">{detail}</p>}
    </Card>
  );
}
