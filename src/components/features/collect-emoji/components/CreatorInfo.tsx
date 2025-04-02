import Image from 'next/image';
import type { EmojiData } from '../types';

interface Props {
  emoji: EmojiData;
}

export function CreatorInfo({ emoji }: Props) {
  const { creator } = emoji;

  return (
    <div className="px-4 pt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Image
            src={creator.avatar || '/placeholder.svg'}
            alt={creator.username}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="font-semibold">{creator.id}</p>
        </div>
        <p className="text-gray-400 text-sm">{creator.timeAgo}</p>
      </div>

      <h1 className="text-4xl font-bold mb-6">{creator.username}</h1>
    </div>
  );
}
