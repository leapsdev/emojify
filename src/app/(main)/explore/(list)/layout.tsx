import { Header } from '@/components/shared/layout/Header';
import { FooterNavigation } from '@/components/shared/navigation/FooterNavigation';
import Image from 'next/image';

export default function CreateEmojiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        backHref="/chat"
        centerContent={
          <Image
            src="/blue-search-icon.png"
            alt="Search"
            width={32}
            height={32}
          />
        }
        className="mb-6"
      />
      {children}
      <FooterNavigation />
    </>
  );
}
