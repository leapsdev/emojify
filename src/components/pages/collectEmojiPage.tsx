import { EMOJI_DATA } from '@/components/features/collect-emoji/constants';
import type { EmojiData } from '@/components/features/collect-emoji/types';
import { CollectButton } from '@/components/features/collect-emoji/components/CollectButton';
import { CreatorInfo } from '@/components/features/collect-emoji/components/CreatorInfo';
import { EmojiDetails } from '@/components/features/collect-emoji/components/EmojiDetails';
import { EmojiImage } from '@/components/features/collect-emoji/components/EmojiImage';


interface Props {
  emoji?: EmojiData;
}

export function CollectEmojiPage({ emoji = EMOJI_DATA }: Props) {
  return (
    <main className="min-h-screen bg-white flex flex-col font-nunito">
      <EmojiImage emoji={emoji} />
      <div className="px-4 pb-4">
        <CreatorInfo emoji={emoji} />
        <EmojiDetails emoji={emoji} />
        <CollectButton />
      </div>
    </main>
  );
}
