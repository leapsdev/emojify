'use client';

import { FooterNavigation } from '@/components/features/chat/chat/footerNavigation';
import { Header } from '@/components/features/chat/chat/header';
import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { NewChatButton } from '@/components/features/chat/chat/newChatButton';
import type { ChatRoom } from '@/types/database';

type ChatRoomListPageProps = {
  initialRooms: ChatRoom[];
};

export const ChatRoomListPage = ({ initialRooms }: ChatRoomListPageProps) => {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <ChatRoomList rooms={initialRooms} />
      <NewChatButton />
      <FooterNavigation />
    </main>
  );
};
