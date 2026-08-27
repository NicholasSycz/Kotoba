export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-sunken ${className}`} aria-hidden />;
}

export function PostCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      <Skeleton className="h-7 w-4/5" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-14" />
          <Skeleton className="mt-2 h-3 w-14" />
        </div>
      </div>
    </div>
  );
}
