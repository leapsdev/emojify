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
import { usePrivy } from '@privy-io/react-auth';

import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import type { User } from '@/repository/db/database';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';

interface ProfilePageProps {
  user: User;
  isOwnProfile?: boolean;
  currentUserId?: string;
  initialIsFriend?: boolean;
}

function ProfilePageContent({
  user,
  isOwnProfile = true,
  currentUserId,
  initialIsFriend = false,
}: ProfilePageProps) {
  const backHref = isOwnProfile ? '/chat' : '/choose-friends';
  const rightContent = isOwnProfile ? <ProfileMenu /> : null;
  // const { address } = useWallet(); // 一時的にコメントアウト
  const address = null; // 一時的にnullに設定
  const { nfts, error } = useGlobalNFTs();
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([]);
  const [collectedNFTs, setCollectedNFTs] = useState<NFT[]>([]);
  const [isLoadingCreated, setIsLoadingCreated] = useState(false);
  const [isLoadingCollected, setIsLoadingCollected] = useState(false);
  // const { authenticated } = usePrivy(); // 一時的にコメントアウト
  const authenticated = false; // 一時的にfalseに設定

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !nfts.length) return;

      setIsLoadingCreated(true);
      setIsLoadingCollected(true);

      try {
        const created: NFT[] = [];
        const collected: NFT[] = [];

        for (const nft of nfts) {
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

              if (isCreator) {
                created.push(nft);
              } else {
                collected.push(nft);
              }
            }
          } catch (err) {
            console.error(`Error processing NFT ${nft.tokenId}:`, err);
          }
        }

        setCreatedNFTs(created);
        setCollectedNFTs(collected);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
      } finally {
        setIsLoadingCreated(false);
        setIsLoadingCollected(false);
      }
    };

    fetchNFTs();
  }, [nfts]); // addressは一時的にnullに固定されているため削除

  if (!authenticated) {
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
    <>
      <Header backHref={backHref} rightContent={rightContent} />
      <main className="flex flex-col font-nunito overflow-hidden max-w-full">
        <div className="overflow-y-auto overflow-x-hidden flex-1">
          <div className="max-w-full">
            <UserProfile
              username={user.username}
              bio={user.bio || ''}
              avatar={user.imageUrl || '/icons/faceIcon-192x192.png'}
              userId={user.id}
              isOwnProfile={isOwnProfile}
              currentUserId={currentUserId}
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
