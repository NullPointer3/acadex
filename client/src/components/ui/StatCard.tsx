import type { ReactNode } from 'react';
import { Card } from './Card';

export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: 'brand' | 'accent';
}) {
  const iconBg =
    tone === 'brand'
      ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
      : 'bg-sky-50 text-sky-600 dark:bg-accent-500/10 dark:text-accent-400';
  return (
    <Card className="group p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-0.5 tabular-nums">{value}</p>
      </div>
    </Card>
  );
}
