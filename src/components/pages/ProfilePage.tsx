'use client';
import {
  type NFT,
  useGlobalNFTs,
} from '@/components/features/chat/chat-room/hooks/useGlobalNFTs';
import { ProfileMenu } from '@/components/features/choose-friends/ProfileMenu';
import { useWallet } from '@/components/features/create-emoji/hooks/useWallet';
import { ProfileTabs } from '@/components/features/profile/ProfileTabs';
import { UserProfile } from '@/components/features/profile/UserProfile';
import { WalletConnectButton } from '@/components/shared/WalletConnectButton';
import { Header } from '@/components/shared/layout/Header';
import { FooterNavigation } from '@/components/shared/navigation/FooterNavigation';
import { Loading } from '@/components/ui/Loading';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import type { User } from '@/repository/db/database';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';

interface ProfilePageProps {
  user: User | null;
  walletAddress?: string; // ユーザーのウォレットアドレス
  isOwnProfile?: boolean;
  currentWalletAddress?: string;
  initialIsFriend?: boolean;
}

function ProfilePageContent({
  user,
  walletAddress,
  isOwnProfile = true,
  currentWalletAddress,
  initialIsFriend = false,
}: ProfilePageProps) {
  const backHref = isOwnProfile ? '/chat' : '/choose-friends';
  const rightContent = isOwnProfile ? <ProfileMenu /> : null;
  const { address } = useWallet();
  const { nfts, error } = useGlobalNFTs();
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([]);
  const [collectedNFTs, setCollectedNFTs] = useState<NFT[]>([]);
  const [isLoadingCreated, setIsLoadingCreated] = useState(false);
  const [isLoadingCollected, setIsLoadingCollected] = useState(false);
  const {
    isAuthenticated,
    isLoading,
    walletAddress: authWalletAddress,
    user: authUser,
  } = useUnifiedAuth();

  // 認証状態の詳細ログ
  console.log('ProfilePage detailed authentication state:', {
    isAuthenticated,
    isLoading,
    authWalletAddress,
    authUser: !!authUser,
    authUserUid: authUser?.uid,
    propsUser: !!user,
    propsWalletAddress: walletAddress,
    timestamp: new Date().toISOString(),
  });

  console.log('ProfilePage received user:', user);
  console.log('User imageUrl:', user?.imageUrl);
  console.log(
    'Avatar prop passed to UserProfile:',
    user?.imageUrl || '/icons/faceIcon-192x192.png',
  );

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !nfts.length) return;

      setIsLoadingCreated(true);
      setIsLoadingCollected(true);

      try {
        // ストリーミング方式: NFTを処理次第、即座にstateに追加
        const processPromises = nfts.map(async (nft) => {
          try {
            const balance = (await readContract(config, {
              ...emojiContract,
              functionName: 'balanceOf',
              args: [address as `0x${string}`, BigInt(nft.tokenId)],
            })) as bigint;

            if (Number(balance) > 0) {
              const minter = (await readContract(config, {
                ...emojiContract,
                functionName: 'firstMinter',
                args: [BigInt(nft.tokenId)],
              })) as string;
              const isCreator = minter.toLowerCase() === address.toLowerCase();

              // 取得次第、即座にstateに追加
              if (isCreator) {
                setCreatedNFTs((prev) => {
                  // 重複チェック: 既に同じtokenIdが存在する場合は追加しない
                  if (prev.some((item) => item.tokenId === nft.tokenId)) {
                    return prev;
                  }
                  return [...prev, nft];
                });
              } else {
                setCollectedNFTs((prev) => {
                  // 重複チェック: 既に同じtokenIdが存在する場合は追加しない
                  if (prev.some((item) => item.tokenId === nft.tokenId)) {
                    return prev;
                  }
                  return [...prev, nft];
                });
              }
            }
          } catch (err) {
            console.error(`Error processing NFT ${nft.tokenId}:`, err);
          }
        });

        await Promise.all(processPromises);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
      } finally {
        setIsLoadingCreated(false);
        setIsLoadingCollected(false);
      }
    };

    // Reset NFTs before fetching
    setCreatedNFTs([]);
    setCollectedNFTs([]);
    fetchNFTs();
  }, [address, nfts]);

  // 認証状態のローディング中はローディングを表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="md" text="Loading..." />
      </div>
    );
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

  // ユーザーデータが存在しない場合はローディングを表示
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="md" text="Loading profile..." />
      </div>
    );
  }

  return (
    <>
      <Header backHref={backHref} rightContent={rightContent} />
      <main className="flex flex-col font-nunito overflow-hidden max-w-full">
        <div className="overflow-y-auto overflow-x-hidden flex-1">
          <div className="max-w-full">
            <UserProfile
              username={user?.username || ''}
              bio={user?.bio || ''}
              avatar={user?.imageUrl || '/icons/faceIcon-192x192.png'}
              walletAddress={walletAddress || ''}
              isOwnProfile={isOwnProfile}
              currentWalletAddress={currentWalletAddress}
              initialIsFriend={initialIsFriend}
            />
            <ProfileTabs
              createdEmojis={createdNFTs.map((nft) => ({
                id: nft.tokenId,
                image: nft.imageUrl || '',
                creator: {
                  avatar: '/icons/faceIcon-192x192.png',
                },
              }))}
              collectedEmojis={collectedNFTs.map((nft) => ({
                id: nft.tokenId,
                image: nft.imageUrl || '',
                creator: {
                  avatar: '/icons/faceIcon-192x192.png',
                },
              }))}
              isLoadingCreated={isLoadingCreated}
              isLoadingCollected={isLoadingCollected}
            />
          </div>
        </div>
      </main>
      <FooterNavigation />
    </>
  );
}

export const ProfilePage = (props: ProfilePageProps) => {
  return <ProfilePageContent {...props} />;
};
