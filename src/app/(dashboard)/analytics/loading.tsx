import { ChartSkeleton } from "@/components/ui/loading-skeleton";

export default function AnalyticsLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-36 mb-2" />
      <div className="skeleton h-4 w-64 mb-8" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="skeleton h-3 w-24 mb-2" />
            <div className="skeleton h-7 w-28" />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
