import { Header } from '@/components/shared/layout/header';
import { FooterNavigation } from '@/components/shared/navigation/footerNavigation';
import { NewChatButton } from '@/components/ui/newChatButton';

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
