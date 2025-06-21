import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import type { EmojiItemData } from '../types';

interface EmojiItemProps {
  item: EmojiItemData;
}

export const EmojiItem = memo(function EmojiItem({ item }: EmojiItemProps) {
  return (
    <Link href={`/explore/${item.tokenId}`} className="block">
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
        <Image
          src={item.imageUrl || '/placeholder.svg'}
          alt={item.name || ''}
          width={300}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
});
