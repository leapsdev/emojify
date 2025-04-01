import Image from 'next/image';
import Link from 'next/link';
import type { GalleryItem } from '../types';
import { CreatorAvatar } from './creatorAvatar';

interface GalleryItemProps {
  item: GalleryItem;
  index: number;
}

export function GalleryItem({ item, index }: GalleryItemProps) {
  return (
    <Link
      href={
        index % 2 === 0
          ? `/emoji-mint/${item.id}`
          : `/emoji-mint-v2/${item.id}`
      }
      className="block"
    >
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
        <Image
          src={item.image || '/placeholder.svg'}
          alt=""
          width={300}
          height={300}
          className="w-full h-full object-cover"
        />
        <CreatorAvatar avatarUrl={item.creator.avatar} />
      </div>
    </Link>
  );
}
