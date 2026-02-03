import { Skeleton } from '@/components/ui/skeleton';

export function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card border">
      {/* Image skeleton */}
      <Skeleton className="aspect-[16/10] w-full" />

      <div className="p-4">
        {/* Brand logo and segment badge */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-1" />

        {/* Subtitle */}
        <Skeleton className="h-4 w-1/2 mb-3" />

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
        </div>

        {/* Price and button */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function CarCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );
}
