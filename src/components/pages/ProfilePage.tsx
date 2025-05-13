'use client';
import {
  type NFT,
  useGlobalNFTs,
} from '@/components/features/chat/chat-room/hooks/useGlobalNFTs';
import { ProfileMenu } from '@/components/features/choose-friends/ProfileMenu';
import { useWallet } from '@/components/features/create-emoji/hooks/useWallet';
import { ProfileTabs } from '@/components/features/profile/ProfileTabs';
import { UserProfile } from '@/components/features/profile/UserProfile';
import { Header } from '@/components/shared/layout/Header';
import { FooterNavigation } from '@/components/shared/navigation/FooterNavigation';
import EthereumProviders from '@/lib/basename/EthereumProviders';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import type { User } from '@/types/database';
import { useContract } from '@thirdweb-dev/react';
import { ThirdwebProvider } from '@thirdweb-dev/react';
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
  const { selectedWalletAddress, noWalletWarning } = useWallet();
  const { nfts, loading, error } = useGlobalNFTs();
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([]);
  const [collectedNFTs, setCollectedNFTs] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!contract || !selectedWalletAddress || !nfts.length) return;

      try {
        const created: NFT[] = [];
        const collected: NFT[] = [];

        for (const nft of nfts) {
          try {
            const balance = await contract.call('balanceOf', [
              selectedWalletAddress,
              nft.tokenId,
            ]);

            if (Number(balance) > 0) {
              const minter = await contract.call('firstMinter', [nft.tokenId]);
              const isCreator =
                minter.toLowerCase() === selectedWalletAddress.toLowerCase();

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
      }
    };

    fetchNFTs();
  }, [contract, selectedWalletAddress, nfts]);

  // デバッグ情報
  console.log('Wallet Address:', selectedWalletAddress);
  console.log('Loading State:', loading);
  console.log('Error State:', error);
  console.log('No Wallet Warning:', noWalletWarning);

  if (noWalletWarning) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-xl">No wallet connected</div>
        <div className="text-gray-500">
          Please restart the app to connect your wallet and view NFTs
        </div>
      </div>
    );
  }

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
              avatar={user.imageUrl || '/icons/icon-192x192.png'}
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
                  avatar: '/icons/icon-192x192.png',
                },
              }))}
              collectedEmojis={collectedNFTs.map((nft) => ({
                id: nft.tokenId,
                image: nft.imageUrl || '',
                creator: {
                  avatar: '/icons/icon-192x192.png',
                },
              }))}
            />
          </div>
        </div>
      </main>
      <FooterNavigation />
    </>
  );
}

export const ProfilePage = (props: ProfilePageProps) => {
  return (
    <EthereumProviders>
      <ThirdwebProvider
        activeChain="base-sepolia-testnet"
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        supportedWallets={[]}
      >
        <ProfilePageContent {...props} />
      </ThirdwebProvider>
    </EthereumProviders>
  );
};
