'use client';

import { FooterNavigation } from '@/components/shared/navigation/footerNavigation';
import { NewChatButton } from '@/components/shared/navigation/newChatButton';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <NewChatButton />
      <FooterNavigation />
    </>
  );
}
