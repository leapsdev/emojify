import { Header } from '@/components/shared/layout/Header';
import { FooterNavigation } from '@/components/shared/navigation/FooterNavigation';
import { NewChatButton } from '@/components/ui/NewChatButton';
import Image from 'next/image';
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        centerContent={
          <Image
            src="/chat-bubble-icon.png"
            alt="Chat"
            width={32}
            height={32}
          />
        }
      />
      {children}
      <NewChatButton />
      <FooterNavigation />
    </>
  );
}
