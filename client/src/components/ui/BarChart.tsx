export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">No data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3" title={`${d.label}: ${d.value}`}>
          <span className="w-28 shrink-0 text-xs text-gray-500 dark:text-gray-400 truncate">{d.label}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-6 text-xs font-medium text-gray-700 dark:text-gray-300 text-right tabular-nums">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}
