import { ChartSkeleton } from "@/components/ui/loading-skeleton";

export default function BudgetsLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-36 mb-2" />
      <div className="skeleton h-4 w-72 mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="skeleton h-3 w-28 mb-2" />
            <div className="skeleton h-7 w-32" />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div>
                <div className="skeleton h-4 w-24 mb-1" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
            <div className="skeleton h-6 w-28 mb-1" />
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
