'use client';
import { ProfileMenu } from '@/components/features/choose-friends/ProfileMenu';
import { useWallet } from '@/components/features/create-emoji/hooks/useWallet';
import { ProfileTabs } from '@/components/features/profile/ProfileTabs';
import { UserProfile } from '@/components/features/profile/UserProfile';
import { useProfileNFTs } from '@/components/features/profile/hooks/useProfileNFTs';
import { Header } from '@/components/shared/layout/Header';
import EthereumProviders from '@/lib/basename/EthereumProviders';
import type { User } from '@/types/database';
import { ConnectWallet, ThirdwebProvider } from '@thirdweb-dev/react';

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
  const { nfts, loading, error } = useProfileNFTs(selectedWalletAddress);

  // デバッグ情報
  console.log('Wallet Address:', selectedWalletAddress);
  console.log('Loading State:', loading);
  console.log('Error State:', error);
  console.log('No Wallet Warning:', noWalletWarning);

  if (noWalletWarning) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-xl">ウォレットを接続してください</div>
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
              avatar="/icons/icon-192x192.png"
              userId={user.id}
              isOwnProfile={isOwnProfile}
              currentUserId={currentUserId}
              initialIsFriend={initialIsFriend}
            />
            <ProfileTabs
              createdEmojis={nfts.map((nft) => ({
                id: nft.tokenId,
                image: nft.imageUrl || '',
                creator: {
                  avatar: '/icons/icon-192x192.png',
                },
              }))}
              collectedEmojis={[]}
            />
          </div>
        </div>
      </main>
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
