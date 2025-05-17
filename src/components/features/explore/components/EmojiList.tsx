'use client';

import { ConnectWallet, ThirdwebProvider } from '@thirdweb-dev/react';
import { useExploreNFTs } from '../hooks/useExploreNFTs';
import { EmojiItem } from './EmojiItem';

export function EmojiList() {
  return (
    <ThirdwebProvider
      activeChain="base"
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <EmojiListContent />
    </ThirdwebProvider>
  );
}

function EmojiListContent() {
  const { nfts, loading, error } = useExploreNFTs();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-500 text-xl">{error}</div>
        <ConnectWallet
          theme="dark"
          modalSize="wide"
          welcomeScreen={{
            title: 'Welcome to Emoji Chat',
            subtitle: 'Connect your wallet to explore NFTs',
          }}
          modalTitleIconUrl=""
        />
      </div>
    );
  }

  return (
    <div className="p-2 flex-1">
      <div className="grid grid-cols-2 gap-2">
        {nfts
          .filter((nft) => nft.imageUrl)
          .map((nft) => (
            <EmojiItem
              key={nft.tokenId}
              item={{
                tokenId: nft.tokenId,
                name: nft.name || `Emoji #${nft.tokenId}`,
                imageUrl: nft.imageUrl || '/placeholder.svg',
                creator: nft.owner
                  ? {
                      id: nft.owner,
                      username: `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`,
                    }
                  : undefined,
                details: {
                  token: 'ETH',
                  network: 'Base',
                },
              }}
            />
          ))}
      </div>
    </div>
  );
}
