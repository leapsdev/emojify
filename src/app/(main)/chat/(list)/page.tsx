'use client';

import { ChatRoomListPage } from '@/components/pages/ChatRoomListPage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getUserRooms } from '@/repository/db/chatroom/actions';
import type { ChatRoom } from '@/repository/db/database';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, userId } = useUnifiedAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      if (isAuthenticated && userId) {
        try {
          const userRooms = await getUserRooms(userId);
          setRooms(userRooms || []);
        } catch (error) {
          console.error('Failed to fetch rooms:', error);
          setRooms([]);
        }
      }
      setIsDataLoading(false);
    };

    fetchRooms();
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

  return <ChatRoomListPage userId={userId || ''} initialRooms={rooms} />;
}
