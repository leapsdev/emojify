'use client';

import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { addFriend, removeFriend } from '@/repository/db/user/actions';
import { Name } from '@coinbase/onchainkit/identity';
import { UserMinus, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { base } from 'viem/chains';
import { useIsFriend } from './hooks/useIsFriend';

interface UserProfileProps {
  username: string;
  bio: string;
  avatar: string;
  walletAddress: string;
  isOwnProfile?: boolean;
  currentWalletAddress?: string;
  initialIsFriend?: boolean;
}

export const UserProfile = ({
  username,
  bio,
  avatar,
  walletAddress,
  isOwnProfile = true,
  currentWalletAddress,
  initialIsFriend = false,
}: UserProfileProps) => {
  const isFriend = useIsFriend(
    currentWalletAddress || '',
    walletAddress,
    initialIsFriend,
  );

  const handleAddFriend = async () => {
    if (!currentWalletAddress) return;
    await addFriend(currentWalletAddress, walletAddress);
  };

  const handleRemoveFriend = async () => {
    if (!currentWalletAddress) return;
    await removeFriend(currentWalletAddress, walletAddress);
  };

  const FriendButton = () => {
    const handleClick = isFriend ? handleRemoveFriend : handleAddFriend;
    const buttonClassName = isFriend
      ? 'bg-gray-400 hover:bg-gray-500'
      : 'bg-blue-500 hover:bg-blue-600';

    const buttonIcon = isFriend ? (
      <UserMinus className="w-6 h-6" strokeWidth={2} />
    ) : (
      <UserPlus className="w-6 h-6" strokeWidth={2} />
    );

    return (
      <Button
        className={`h-9 rounded-2xl px-7 w-24 flex items-center justify-center mt-3 ${buttonClassName} text-white`}
        onClick={handleClick}
      >
        {buttonIcon}
      </Button>
    );
  };

  const RightButton = () => {
    return isOwnProfile ? (
      <LinkButton
        href="/profile/edit"
        content="Edit Profile"
        className="h-9 rounded-2xl text-sm px-5 bg-gray-200 hover:bg-gray-300 border-0 text-gray-600 mt-3 font-black shrink-0"
      />
    ) : (
      <FriendButton />
    );
  };

  return (
    <div className="px-4 pt-4">
      <div className="mb-8">
        {/* プロフィール画像とユーザー情報 */}
        <div className="flex flex-wrap mb-4">
          <div className="relative w-24 h-24">
            <Image
              src={avatar}
              alt={'ユーザーのプロフィール画像'}
              fill
              sizes="(max-width: 768px) 96px, 96px"
              priority
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex flex-1 min-w-0 items-start justify-between ml-4">
            <div className="pt-3 min-w-0">
              <h2 className="text-2xl font-black truncate">{username}</h2>
              <div className="text-[13px] text-gray-600 font-bold truncate">
                {walletAddress && (
                  <Name address={walletAddress as `0x${string}`} chain={base} />
                )}
              </div>
            </div>
            <RightButton />
          </div>
        </div>

        {/* Bio */}
        <p className="text-[15px] text-gray-800 font-bold break-words">{bio}</p>
      </div>
    </div>
  );
};
