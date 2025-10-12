'use client';

import { ChatRoomListPage } from '@/components/pages/ChatRoomListPage';
import { Loading } from '@/components/ui/Loading';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getUserRooms } from '@/repository/db/chatroom/actions';
import type { ChatRoom } from '@/repository/db/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress, user } = useUnifiedAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [authRecoveryAttempted, setAuthRecoveryAttempted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      if (isAuthenticated && walletAddress && user) {
        try {
          const userRooms = await getUserRooms(walletAddress);
          setRooms(userRooms || []);
        } catch (error) {
          console.error('[ChatListPage] Error fetching chat rooms:', error);
          setRooms([]);
        }
      }
      setIsDataLoading(false);
    };

    fetchRooms();
  }, [isAuthenticated, walletAddress, user]);

  // Mini App環境での認証状態復旧を待つ
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authRecoveryAttempted) {
      setAuthRecoveryAttempted(true);

      // Mini App環境では認証復旧により長い時間を待つ
      const timeoutId = setTimeout(() => {
        router.push('/');
      }, 3000); // 3秒待機して認証復旧を待つ

      return () => clearTimeout(timeoutId);
    }

    // 認証が回復した場合は復旧フラグをリセット
    if (isAuthenticated && authRecoveryAttempted) {
      setAuthRecoveryAttempted(false);
    }
  }, [isAuthenticated, isLoading, authRecoveryAttempted, router]);

  if (isLoading || isDataLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="md" text="Loading..." />
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
