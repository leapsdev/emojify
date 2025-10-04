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

  // 未認証の場合はホームページにリダイレクト
  useEffect(() => {
    console.log('🔄 Chat page redirect check:', {
      isLoading,
      isAuthenticated,
      shouldRedirect: !isLoading && !isAuthenticated,
    });

    // 認証状態の初期化が完了し、かつ未認証の場合のみリダイレクト
    // これにより、ページ遷移時の一時的な認証状態リセットを回避
    if (!isLoading && !isAuthenticated) {
      // 少し待機してからリダイレクト（認証状態の復旧を待つ）
      const timeoutId = setTimeout(() => {
        console.log('🚀 Redirecting to / due to unauthenticated state');
        console.log(
          '🚨 REDIRECT TRIGGERED - Current URL:',
          window.location.href,
        );
        console.log('🚨 REDIRECT TRIGGERED - Auth state:', {
          isLoading,
          isAuthenticated,
        });
        router.push('/');
      }, 500); // 500ms待機

      return () => clearTimeout(timeoutId);
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
