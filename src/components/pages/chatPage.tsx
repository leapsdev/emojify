'use client';

import { useEffect, useState } from 'react';
import { FooterNavigation } from '@/components/features/chat/chat/footerNavigation';
import { Header } from '@/components/features/chat/chat/header';
import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { NewMessageButton } from '@/components/features/chat/chat/newMessageButton';
import { subscribeToUserRooms } from '@/repository/chat/actions';
import { usePrivyId } from '@/hooks/usePrivyId';
import { formatRelativeTime } from '@/utils/date';
import type { ChatRoom } from '@/types/database';

export const ChatPage = () => {
  const userId = usePrivyId();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserRooms(userId, (updatedRooms) => {
      setRooms(updatedRooms);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const transformedRooms = rooms.map(room => ({
    id: room.id,
    username: `Room ${room.id}`,  // 一時的な表示
    avatar: '/placeholder.svg',
    message: room.lastMessage?.content || '',
    time: room.lastMessage ? formatRelativeTime(room.lastMessage.createdAt) : '',
    online: false
  }));

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <ChatRoomList rooms={transformedRooms} />
      <NewMessageButton />
      <FooterNavigation />
    </main>
  );  
};
