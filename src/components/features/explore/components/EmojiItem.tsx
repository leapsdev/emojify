import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import type { EmojiItemData } from '../types';

interface EmojiItemProps {
  item: EmojiItemData;
  priority?: boolean;
}

export const EmojiItem = memo(function EmojiItem({
  item,
  priority = false,
}: EmojiItemProps) {
  return (
    <Link href={`/explore/${item.tokenId}`} className="block">
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
        <Image
          src={item.imageUrl || '/placeholder.svg'}
          alt={item.name || ''}
          width={300}
          height={300}
          className="w-full h-full object-cover"
          loading={priority ? undefined : 'lazy'}
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>
    </Link>
  );
});
