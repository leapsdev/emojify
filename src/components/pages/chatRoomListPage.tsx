'use client';

import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { Header } from '@/components/features/chat/chat/header';
import { useUserRooms } from '@/components/features/chat/chat/hooks/useUserRooms';
import { FooterNavigation } from '@/components/shared/navigation/footerNavigation';
import { NewChatButton } from '@/components/shared/navigation/newChatButton';
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
      <ChatRoomList rooms={rooms} currentUserId={userId} />
      <NewChatButton />
      <FooterNavigation />
    </main>
  );
}
