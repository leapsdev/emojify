'use client';

import { ClientChooseFriendsPage } from '@/components/pages/ChooseFriendsPage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUsersWithFriendship } from '@/repository/db/user/actions';
import { useEffect, useState } from 'react';

export default function ChooseFriendsPage() {
  const { isAuthenticated, isLoading, userId } = useUnifiedAuth();
  const [friendshipData, setFriendshipData] = useState<{
    friends: User[];
    others: User[];
  }>({ friends: [], others: [] });
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchFriendshipData = async () => {
      if (isAuthenticated && userId) {
        try {
          const data = await getUsersWithFriendship(userId);
          setFriendshipData(data);
        } catch (error) {
          console.error('Failed to fetch friendship data:', error);
        }
      }
      setIsDataLoading(false);
    };

    fetchFriendshipData();
  }, [isAuthenticated, userId]);

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Authentication is required</p>
        </div>
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
