'use client';

import { EmojiList } from '@/components/features/explore/components/emojiList';
import { ThirdwebProvider } from '@thirdweb-dev/react';

export function ExplorePage() {
  return (
    <ThirdwebProvider 
      activeChain="base-sepolia-testnet"
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <main className="flex flex-col">
        <EmojiList />
      </main>
    </ThirdwebProvider>
  );
}
