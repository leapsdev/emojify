import type { EmojiProps } from '@/components/features/profile/types';
import Image from 'next/image';

interface EmojiGridProps {
  emojis: EmojiProps[];
}

export const EmojiGrid = ({ emojis }: EmojiGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {emojis.map((emoji, index) => (
        <div
          key={emoji.id}
          className="relative aspect-square bg-white rounded-lg p-2"
        >
          <div className="w-full h-full relative">
            {/* NFT画像 */}
            <div className="relative w-full h-full">
              <Image
                src={emoji.image || '/icons/faceIcon-192x192.png'}
                alt={`Emoji ${emoji.id}`}
                fill
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                className="object-cover rounded-lg"
                loading={index < 6 ? undefined : 'lazy'}
                priority={index < 6}
              />
            </div>
            {/* クリエイターアイコン */}
            <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full overflow-hidden border-2 border-white">
              <div className="relative w-full h-full">
                <Image
                  src={emoji.creator.avatar || '/icons/faceIcon-192x192.png'}
                  alt="Creator"
                  fill
                  sizes="24px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
