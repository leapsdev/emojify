'use client';

import { EmojiList } from '@/components/features/explore/components/EmojiList';
import { activeChain } from '@/lib/thirdweb';
import { ThirdwebProvider } from '@thirdweb-dev/react';

export function ExplorePage() {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <main className="flex flex-col">
        <EmojiList />
      </main>
    </ThirdwebProvider>
  );
}
