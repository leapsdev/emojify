'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import type { User } from '@/repository/db/database';
import { getUserById } from '@/repository/db/user/actions';
import { usePrivy } from '@privy-io/react-auth';
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { user, authenticated } = usePrivy();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [targetUserId, setTargetUserId] = useState<string>('');

  useEffect(() => {
    const initializePage = async () => {
      const decodedParams = await params;
      const id = decodeURIComponent(decodedParams.id);
      setTargetUserId(id);
    };

    initializePage();
  }, [params]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authenticated && user?.id && targetUserId) {
        try {
          const [target, current] = await Promise.all([
            getUserById(targetUserId),
            getUserById(user.id),
          ]);
          setTargetUser(target);
          setCurrentUser(current);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [authenticated, user?.id, targetUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user?.id || !targetUser || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>認証が必要です</p>
        </div>
      </div>
    );
  }

  // フレンド状態の初期値を取得
  const initialIsFriend = Boolean(currentUser?.friends?.[targetUserId]);

  return (
    <ProfilePage
      user={targetUser}
      isOwnProfile={false}
      currentUserId={user.id}
      initialIsFriend={initialIsFriend}
    />
  );
}
