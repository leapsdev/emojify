'use client';

import { ChatRoomListPage } from '@/components/pages/ChatRoomListPage';
import { getUserRooms } from '@/repository/db/chat/actions';
import type { ChatRoom } from '@/repository/db/database';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export default function Page() {
  const { user, authenticated } = usePrivy();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      if (authenticated && user?.id) {
        try {
          const userRooms = await getUserRooms(user.id);
          setRooms(userRooms || []);
        } catch (error) {
          console.error('Failed to fetch rooms:', error);
          setRooms([]);
        }
      }
      setIsLoading(false);
    };

    fetchRooms();
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

  return <ChatRoomListPage userId={user.id} initialRooms={rooms} />;
}
