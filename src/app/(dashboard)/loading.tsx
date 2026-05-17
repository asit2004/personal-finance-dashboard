import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div>
      {/* Hero greeting skeleton */}
      <div className="mb-8 pt-4">
        <div className="skeleton h-4 w-32 mb-2" />
        <div className="skeleton h-9 w-72 mb-2" />
        <div className="skeleton h-4 w-96" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
