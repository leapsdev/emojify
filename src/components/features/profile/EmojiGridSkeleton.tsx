import { Skeleton } from '@/components/ui/Skeleton';

interface EmojiGridSkeletonProps {
  count?: number;
}

export function EmojiGridSkeleton({ count = 6 }: EmojiGridSkeletonProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative aspect-square bg-white rounded-lg p-2"
        >
          <div className="w-full h-full relative">
            <Skeleton className="w-full h-full rounded-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full overflow-hidden border-2 border-white">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
