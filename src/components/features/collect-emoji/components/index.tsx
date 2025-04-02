import { EMOJI_DATA } from '../constants';
import type { EmojiData } from '../types';
import { CollectButton } from './CollectButton';
import { CreatorInfo } from './CreatorInfo';
import { EmojiDetails } from './EmojiDetails';
import { EmojiImage } from './EmojiImage';

interface Props {
  emoji?: EmojiData;
}

export function CollectEmoji({ emoji = EMOJI_DATA }: Props) {
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
