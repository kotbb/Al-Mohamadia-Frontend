import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface DashboardSkeletonProps {
  message: string;
}

export function DashboardSkeleton({ message }: DashboardSkeletonProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">{message}</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 motion-safe:animate-pulse"
      >
        {[0, 1, 2, 3, 4].map((key) => (
          <SurfaceCard key={key} padding="none" className="p-5 sm:p-6">
            <div className="flex min-h-9 items-center">
              <div className="h-5 w-36 max-w-full rounded bg-surface-muted" />
            </div>
            <div className="mt-3 h-10 w-28 rounded bg-surface-muted" />
            <div className="mt-4 min-h-8 border-t border-border/40 pt-3">
              <div className="h-5 w-48 max-w-full rounded bg-surface-muted" />
            </div>
          </SurfaceCard>
        ))}
      </div>
      <div aria-hidden="true" className="flex flex-col gap-6 motion-safe:animate-pulse">
        <div className="h-11 w-full max-w-md rounded-lg bg-surface-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1].map((key) => (
            <SurfaceCard key={key} className="h-24">
              <div className="h-5 w-32 rounded bg-surface-muted" />
            </SurfaceCard>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <SurfaceCard className="min-h-[280px] lg:col-span-3">
            <div className="h-5 w-32 rounded bg-surface-muted" />
          </SurfaceCard>
          <SurfaceCard className="min-h-[280px] lg:col-span-2">
            <div className="h-5 w-32 rounded bg-surface-muted" />
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
