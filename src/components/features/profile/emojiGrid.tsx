import type { EmojiProps } from '@/components/features/profile/types';
import Image from 'next/image';

interface EmojiGridProps {
  emojis: EmojiProps[];
}

export const EmojiGrid = ({ emojis }: EmojiGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="relative aspect-square bg-white rounded-lg p-2"
        >
          <div className="w-full h-full bg-red-500 relative">
            {/* 花の茎 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-green-500" />
            {/* クリエイターアイコン */}
            <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full overflow-hidden border-2 border-white">
              <div className="relative w-full h-full">
                <Image
                  src={emoji.creator.avatar || '/placeholder.svg'}
                  alt="Creator"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
