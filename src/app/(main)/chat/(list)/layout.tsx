'use client';

import { NewChatButton } from '@/components/shared/navigation/newChatButton';
import { FooterNavigation } from '@/components/shared/navigation/footerNavigation';

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
