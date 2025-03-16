'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface UserProfileProps {
  username: string;
  walletAddress: string;
  bio: string;
  avatar: string;
}

export const UserProfile = ({
  username,
  walletAddress,
  bio,
  avatar,
}: UserProfileProps) => {
  return (
    <div className="px-4 pt-4">
      <div className="mb-8">
        {/* プロフィール画像とユーザー情報 */}
        <div className="flex mb-4">
          <div className="relative w-24 h-24">
            <Image
              src={avatar || '/placeholder.svg'}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex flex-1 items-center justify-between ml-4">
            <div className="pt-3">
              <h2 className="text-2xl font-black">{username}</h2>
              <p className="text-[13px] text-gray-600 font-bold">
                {walletAddress}
              </p>
            </div>
            <Button
              variant="outline"
              className="h-9 rounded-2xl text-sm px-5 bg-gray-50 hover:bg-gray-100 border-0 text-gray-600 mt-3 font-black"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[15px] text-gray-800 font-bold">{bio}</p>
      </div>
    </div>
  );
};
