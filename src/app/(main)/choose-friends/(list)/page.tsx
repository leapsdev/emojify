'use client';

import { ClientChooseFriendsPage } from '@/components/pages/ChooseFriendsPage';
import type { User } from '@/repository/db/database';
import { getUsersWithFriendship } from '@/repository/db/user/actions';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export default function ChooseFriendsPage() {
  const { user, authenticated } = usePrivy();
  const [friendshipData, setFriendshipData] = useState<{
    friends: User[];
    others: User[];
  }>({ friends: [], others: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriendshipData = async () => {
      if (authenticated && user?.id) {
        try {
          const data = await getUsersWithFriendship(user.id);
          setFriendshipData(data);
        } catch (error) {
          console.error('Failed to fetch friendship data:', error);
        }
      }
      setIsLoading(false);
    };

    fetchFriendshipData();
  }, [authenticated, user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user?.id) {
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
