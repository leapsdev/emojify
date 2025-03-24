'use client';

import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { FooterNavigation } from '@/components/features/chat/chat/footerNavigation';
import { Header } from '@/components/features/chat/chat/header';
import { useUserRooms } from '@/components/features/chat/chat/hooks/useUserRooms';
import { NewChatButton } from '@/components/features/chat/chat/newChatButton';

type ChatRoomListPageProps = {
  userId: string;
};

export function ChatRoomListPage({ userId }: ChatRoomListPageProps) {
  const rooms = useUserRooms(userId);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <ChatRoomList rooms={rooms} />
      <NewChatButton />
      <FooterNavigation />
    </main>
  );
}
