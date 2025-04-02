import Image from 'next/image';
import type { EmojiData } from '../types';

interface Props {
  emoji: EmojiData;
}

export function EmojiImage({ emoji }: Props) {
  return (
    <div className="flex items-center justify-center px-4 pt-4 pb-3">
      <Image
        src={emoji.image || '/placeholder.svg'}
        alt="Emoji Art"
        width={400}
        height={600}
        className="max-w-full max-h-[55vh] object-contain rounded-md"
      />
    </div>
  );
}
