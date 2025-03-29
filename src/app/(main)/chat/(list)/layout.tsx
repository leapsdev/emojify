'use client';

import { Header } from '@/components/shared/layout/header';
import { NewChatButton } from '@/components/shared/navigation/newChatButton';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header centerContent={<span className="text-2xl">💬</span>} />
      {children}
      <NewChatButton />
    </>
  );
}
