'use client';

import { ChatRoomListPage } from '@/components/pages/ChatRoomListPage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getUserRooms } from '@/repository/db/chatroom/actions';
import type { ChatRoom } from '@/repository/db/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      if (isAuthenticated && walletAddress) {
        try {
          const userRooms = await getUserRooms(walletAddress);
          setRooms(userRooms || []);
        } catch (error) {
          console.error('Failed to fetch rooms:', error);
          setRooms([]);
        }
      }
      setIsDataLoading(false);
    };

    fetchRooms();
  }, [isAuthenticated, walletAddress]);

  // 未認証の場合はホームページにリダイレクト
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isDataLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatRoomListPage
      walletAddress={walletAddress || ''}
      initialRooms={rooms}
    />
  );
}
