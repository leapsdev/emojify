'use client';

import { INITIAL_MESSAGES } from '@/components/features/chat/shared/constants';
import { FooterNavigation } from '@/components/features/chat/chat/footerNavigation';
import { Header } from '@/components/features/chat/chat/header';
import { MessageList } from '@/components/features/chat/chat/messageList';
import { NewMessageButton } from '@/components/features/chat/chat/newMessageButton';

export const ChatPage = () => {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <MessageList messages={INITIAL_MESSAGES} />
      <NewMessageButton />
      <FooterNavigation />
    </main>
  );
};
