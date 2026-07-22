import type { HTMLAttributes, ReactNode } from 'react';

export function Card({
  className = '',
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl transition-shadow duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
