'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/clientAction';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !walletAddress) {
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await getUser(walletAddress);
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, walletAddress]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timeoutId = setTimeout(() => {
        router.push('/');
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return <ProfilePage user={userData || null} />;
}
