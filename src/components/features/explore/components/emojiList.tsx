'use client';

import { ConnectWallet, ThirdwebProvider } from '@thirdweb-dev/react';
import Image from 'next/image';
import { useExploreNFTs } from '../hooks/useExploreNFTs';

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
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {nft.imageUrl && (
              <div className="relative aspect-square">
                <Image
                  src={nft.imageUrl}
                  alt={nft.name || `Emoji #${nft.tokenId}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-2">
              <h2 className="text-sm font-semibold truncate">
                {nft.name || `Emoji #${nft.tokenId}`}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
