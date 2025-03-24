'use client';

import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { FooterNavigation } from '@/components/features/chat/chat/footerNavigation';
import { Header } from '@/components/features/chat/chat/header';
import { useUserRooms } from '@/components/features/chat/chat/hooks/useUserRooms';
import { NewChatButton } from '@/components/features/chat/chat/newChatButton';
import type { ChatRoom } from '@/types/database';

type ChatRoomListPageProps = {
  userId: string;
  initialRooms: ChatRoom[];
};

export function ChatRoomListPage({
  userId,
  initialRooms,
}: ChatRoomListPageProps) {
  const rooms = useUserRooms(userId, initialRooms);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <ChatRoomList rooms={rooms} />
      <NewChatButton />
      <FooterNavigation />
    </main>
  );
}
