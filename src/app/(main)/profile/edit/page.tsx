'use client';

import { ProfileEditPage } from '@/components/pages/ProfileEditPage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/actions';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, userId } = useUnifiedAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && userId) {
        try {
          const data = await getUser(userId);
          setUserData(data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setIsDataLoading(false);
    };

    fetchUserData();
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

  return <ProfileEditPage initialUser={userData} />;
}
