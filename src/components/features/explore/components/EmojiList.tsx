'use client';

import { WalletConnectButton } from '@/components/shared/WalletConnectButton';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useMemo } from 'react';
import { useExploreNFTs } from '../hooks/useExploreNFTs';
import { EmojiItem } from './EmojiItem';
import { EmojiItemSkeleton } from './EmojiItemSkeleton';

export function EmojiList() {
  return <EmojiListContent />;
}

function EmojiListContent() {
  const { nfts, loading, error } = useExploreNFTs();
  const { isAuthenticated, isLoading: isAuthLoading } = useUnifiedAuth();

  // フィルタリングとメモ化
  const filteredNFTs = useMemo(() => {
    return nfts.filter((nft) => nft.imageUrl);
  }, [nfts]);

  // 認証状態のローディング中は何も表示しない
  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
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
        {/* 取得済みのNFTを表示 */}
        {filteredNFTs.map((nft, index) => (
          <EmojiItem
            key={nft.tokenId}
            priority={index < 4}
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
        {/* ローディング中はスケルトンを表示 */}
        {loading &&
          Array.from({ length: filteredNFTs.length === 0 ? 6 : 2 }).map(
            (_, index) => <EmojiItemSkeleton key={`skeleton-${index}`} />,
          )}
      </div>
    </div>
  );
}
