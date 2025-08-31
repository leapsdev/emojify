'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/actions';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export default function Page() {
  const { user, authenticated } = usePrivy();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authenticated && user?.id) {
        try {
          const data = await getUser(user.id);
          setUserData(data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [authenticated, user?.id]);

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

  if (!authenticated || !user?.id || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>認証が必要です</p>
        </div>
      </div>
    );
  }

  return <ProfilePage user={userData} />;
}
