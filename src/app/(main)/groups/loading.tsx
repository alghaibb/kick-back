export default function Loading() {
  return (
    <div className="container py-8">
      {/* Page Header Skeleton */}
      <div className="h-16 w-full bg-muted animate-pulse rounded-lg mb-8" />

      {/* Content Skeleton */}
      <div className="w-full h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}
