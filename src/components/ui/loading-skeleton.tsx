import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <LoadingSkeleton className="h-4 w-24 mb-3" />
      <LoadingSkeleton className="h-8 w-32 mb-2" />
      <LoadingSkeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-6">
      <LoadingSkeleton className="h-5 w-40 mb-4" />
      <LoadingSkeleton className="h-[200px] w-full" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <LoadingSkeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1">
        <LoadingSkeleton className="h-4 w-32 mb-1" />
        <LoadingSkeleton className="h-3 w-20" />
      </div>
      <LoadingSkeleton className="h-5 w-20" />
    </div>
  );
}
