import Image from 'next/image';
import Link from 'next/link';
import type { EmojiItemData } from '../types';

interface EmojiItemProps {
  item: EmojiItemData;
}

export function EmojiItem({ item }: EmojiItemProps) {
  return (
    <Link href={`/explore/${item.id}`} className="block">
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
        <Image
          src={item.image || '/placeholder.svg'}
          alt=""
          width={300}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
}
