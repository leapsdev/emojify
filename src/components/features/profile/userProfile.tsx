'use client';

import { Button } from '@/components/ui/button';
import { UserMinus, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { addFriend, removeFriend } from '@/repository/user/actions';
import { useIsFriend } from './hooks/useIsFriend';

interface UserProfileProps {
  username: string;
  bio: string;
  avatar: string;
  userId: string;
  isOwnProfile?: boolean;
  currentUserId?: string;
  initialIsFriend?: boolean;
}

export const UserProfile = ({
  username,
  bio,
  avatar,
  userId,
  isOwnProfile = true,
  currentUserId,
  initialIsFriend = false,
}: UserProfileProps) => {
  const isFriend = useIsFriend(currentUserId || '', userId, initialIsFriend);

  const handleAddFriend = async () => {
    if (!currentUserId) return;
    await addFriend(currentUserId, userId);
  };

  const handleRemoveFriend = async () => {
    if (!currentUserId) return;
    await removeFriend(currentUserId, userId);
  };

  return (
    <div className="px-4 pt-4">
      <div className="mb-8">
        {/* プロフィール画像とユーザー情報 */}
        <div className="flex flex-wrap mb-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={avatar || '/placeholder.svg'}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex flex-1 min-w-0 items-start justify-between ml-4">
            <div className="pt-3 min-w-0">
              <h2 className="text-2xl font-black truncate">{username}</h2>
              <p className="text-[13px] text-gray-600 font-bold truncate">
                {userId}
              </p>
            </div>
            {isOwnProfile ? (
              <Link href="/profile/edit">
                <Button
                  variant="outline"
                  className="h-9 rounded-2xl text-sm px-5 bg-gray-50 hover:bg-gray-100 border-0 text-gray-600 mt-3 font-black shrink-0"
                >
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <>
                {isFriend ? (
                  <Button
                    className="h-9 rounded-2xl px-7 w-24 flex items-center justify-center mt-3 bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleRemoveFriend}
                  >
                    <UserMinus className="w-6 h-6" strokeWidth={2} />
                  </Button>
                ) : (
                  <Button
                    className="h-9 rounded-2xl px-7 w-24 flex items-center justify-center mt-3 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleAddFriend}
                  >
                    <UserPlus className="w-6 h-6" strokeWidth={2} />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-[15px] text-gray-800 font-bold break-words">{bio}</p>
      </div>
    </div>
  );
};
