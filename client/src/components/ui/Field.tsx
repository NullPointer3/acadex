import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

const fieldClass =
  'w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-white/5 dark:border-white/10 dark:text-gray-100 dark:placeholder:text-gray-500 disabled:opacity-50';

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{children}</label>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className ?? ''}`} />;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
