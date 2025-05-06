import { Header } from '@/components/shared/layout/Header';
import { FooterNavigation } from '@/components/shared/navigation/FooterNavigation';
import { NewChatButton } from '@/components/ui/NewChatButton';

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
      <FooterNavigation />
    </>
  );
}
