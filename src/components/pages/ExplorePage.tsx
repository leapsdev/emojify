'use client';

import { EmojiList } from '@/components/features/explore/components/EmojiList';
import { activeChain } from '@/lib/thirdweb';
import EthereumProviders from '@/lib/basename/EthereumProviders';

export function ExplorePage() {
  return (
    <EthereumProviders>
      <main className="flex flex-col">
        <EmojiList />
      </main>
    </EthereumProviders>
  );
}
