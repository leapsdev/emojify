import { Header } from '@/components/shared/layout/Header';
import Image from 'next/image';

export default function ChooseFriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        backHref="/chat"
        centerContent={
          <Image src="/smiling-faces.png" alt="Chat" width={32} height={32} />
        }
      />
      {children}
    </>
  );
}
