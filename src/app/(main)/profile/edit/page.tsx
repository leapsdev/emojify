'use client';

import { ProfileEditPage } from '@/components/pages/ProfileEditPage';
import { Loading } from '@/components/ui/Loading';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/actions';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && walletAddress) {
        try {
          const data = await getUser(walletAddress);
          console.log('📸 [ProfileEdit/page] Fetched user data:', {
            hasData: !!data,
            imageUrl: data?.imageUrl,
            username: data?.username,
          });
          setUserData(data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setIsDataLoading(false);
    };

    fetchUserData();
  }, [isAuthenticated, walletAddress]);

  if (isLoading || isDataLoading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="md" text="Loading..." />
      </div>
    );
  }

  return (
    <ProfileEditPage
      initialUser={userData}
      walletAddress={walletAddress || ''}
    />
  );
}
