'use client';

import { ClientChooseFriendsPage } from '@/components/pages/ChooseFriendsPage';
import { Loading } from '@/components/ui/Loading';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUsersWithFriendship } from '@/repository/db/user/actions';
import { useEffect, useState } from 'react';

export default function ChooseFriendsPage() {
  const { isAuthenticated, isLoading, walletAddress, user } = useUnifiedAuth();
  const [friendshipData, setFriendshipData] = useState<{
    friends: Array<User & { walletAddress: string }>;
    others: Array<User & { walletAddress: string }>;
  }>({ friends: [], others: [] });
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchFriendshipData = async () => {
      if (isAuthenticated && walletAddress && user) {
        try {
          const data = await getUsersWithFriendship(walletAddress);
          setFriendshipData(data);
        } catch (error) {
          console.error('[ChooseFriendsPage] Data fetch error:', error);
        }
      }
      setIsDataLoading(false);
    };

    fetchFriendshipData();
  }, [isAuthenticated, walletAddress, user]);

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="md" text="Loading..." />
      </div>
    );
  }

  return (
    <ClientChooseFriendsPage
      initialFriends={friendshipData.friends}
      initialOthers={friendshipData.others}
    />
  );
}
