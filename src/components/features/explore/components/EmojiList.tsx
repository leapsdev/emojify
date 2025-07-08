'use client';

import { WalletConnectButton } from '@/components/shared/WalletConnectButton';
import { Loading } from '@/components/ui/Loading';
import { useCollectWallet } from '@/hooks/useCollectWallet';
import { activeChain } from '@/lib/thirdweb';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { useMemo } from 'react';
import { useExploreNFTs } from '../hooks/useExploreNFTs';
import { EmojiItem } from './EmojiItem';

export function EmojiList() {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <EmojiListContent />
    </ThirdwebProvider>
  );
}

function EmojiListContent() {
  const { nfts, loading, error } = useExploreNFTs();
  const { isConnected } = useCollectWallet();

  // フィルタリングとメモ化
  const filteredNFTs = useMemo(() => {
    return nfts.filter((nft) => nft.imageUrl);
  }, [nfts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="xl" className="mb-4" />
      </div>
    );
  }

  if (!isConnected) {
    return <WalletConnectButton />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-2 flex-1">
      <div className="grid grid-cols-2 gap-2">
        {filteredNFTs.map((nft) => (
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
