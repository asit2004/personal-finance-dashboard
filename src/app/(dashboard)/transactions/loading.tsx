import { ChartSkeleton, TableRowSkeleton } from "@/components/ui/loading-skeleton";

export default function TransactionsLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-4 w-72 mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="skeleton h-3 w-28 mb-2" />
            <div className="skeleton h-7 w-32" />
          </div>
        ))}
      </div>

      <div className="glass-card p-5 mb-6">
        <div className="flex gap-3">
          <div className="skeleton h-10 flex-1" />
          <div className="skeleton h-10 w-40" />
          <div className="skeleton h-10 w-32" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex gap-4 px-5 py-3 border-b border-[var(--border-color)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-3 w-20" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
