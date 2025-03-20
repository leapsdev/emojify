'use client';

import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { FooterNavigation } from '@/components/features/chat/chat/footerNavigation';
import { Header } from '@/components/features/chat/chat/header';
import { NewChatButton } from '@/components/features/chat/chat/newChatButton';
import { subscribeToUserRoomsAction } from '@/components/features/chat/chat/action';
import type { ChatRoom } from '@/types/database';
import { usePrivyId } from '@/hooks/usePrivyId';
import { useEffect, useState } from 'react';

type ChatRoomListPageProps = {
  initialRooms: ChatRoom[];
};

export function ChatRoomListPage({ initialRooms }: ChatRoomListPageProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
  const userId = usePrivyId();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserRoomsAction(userId, setRooms);
    return () => unsubscribe();
  }, [userId]);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <ChatRoomList rooms={rooms} />
      <NewChatButton />
      <FooterNavigation />
    </main>
  );
}
