'use client';

import { ConnectWallet, ThirdwebProvider } from '@thirdweb-dev/react';
import { useExploreNFTs } from '../hooks/useExploreNFTs';
import { EmojiItem } from './EmojiItem';

export function EmojiList() {
  return (
    <ThirdwebProvider
      activeChain="base-sepolia-testnet"
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
            title: 'Emoji Chatへようこそ',
            subtitle: 'NFTを探索するにはウォレットを接続してください',
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
                id: nft.tokenId,
                image: nft.imageUrl as string,
                name: nft.name || `Emoji #${nft.tokenId}`,
                creator: {
                  id: nft.owner || 'unknown',
                  avatar: '/placeholder.svg',
                },
              }}
            />
          ))}
      </div>
    </div>
  );
}
