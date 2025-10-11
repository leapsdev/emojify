import { Skeleton } from '@/components/ui/Skeleton';

export function EmojiItemSkeleton() {
  return (
    <div className="block">
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}
