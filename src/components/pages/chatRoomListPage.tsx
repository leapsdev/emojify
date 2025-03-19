'use client';

import { FooterNavigation } from '@/components/features/chat/chat/footerNavigation';
import { Header } from '@/components/features/chat/chat/header';
import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { NewChatButton } from '@/components/features/chat/chat/newChatButton';
import { INITIAL_MESSAGES } from '@/components/features/chat/shared/constants';

export const ChatRoomListPage = () => {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <ChatRoomList messages={INITIAL_MESSAGES} />
      <NewChatButton />
      <FooterNavigation />
    </main>
  );
};
