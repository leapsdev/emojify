'use client';

import { ChatRoomListPage } from '@/components/pages/ChatRoomListPage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getUserRooms } from '@/repository/db/chatroom/actions';
import type { ChatRoom } from '@/repository/db/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  console.log('🏁 Chat page component started');

  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [authRecoveryAttempted, setAuthRecoveryAttempted] = useState(false);
  const router = useRouter();

  console.log('📊 Chat page initial state:', {
    isAuthenticated,
    isLoading,
    walletAddress,
    rooms: rooms.length,
    isDataLoading,
  });

  // 認証状態のデバッグログ
  useEffect(() => {
    console.log('📊 Chat page auth state:', {
      isAuthenticated,
      isLoading,
      walletAddress,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, isLoading, walletAddress]);

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

  // Mini App環境での認証状態復旧を待つ
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authRecoveryAttempted) {
      console.log('🔄 Chat page - Waiting for auth recovery in Mini App');
      setAuthRecoveryAttempted(true);

      // Mini App環境では認証復旧により長い時間を待つ
      const timeoutId = setTimeout(() => {
        console.log(
          '🚀 Redirecting to / due to unauthenticated state after wait',
        );
        console.log(
          '🚨 REDIRECT TRIGGERED - Current URL:',
          window.location.href,
        );
        console.log('🚨 REDIRECT TRIGGERED - Auth state:', {
          isLoading,
          isAuthenticated,
        });
        router.push('/');
      }, 3000); // 3秒待機して認証復旧を待つ

      return () => clearTimeout(timeoutId);
    }

    // 認証が回復した場合は復旧フラグをリセット
    if (isAuthenticated && authRecoveryAttempted) {
      console.log('✅ Auth recovered, resetting recovery flag');
      setAuthRecoveryAttempted(false);
    }
  }, [isAuthenticated, isLoading, authRecoveryAttempted, router]);

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
