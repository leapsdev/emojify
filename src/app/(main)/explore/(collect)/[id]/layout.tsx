import { Header } from '@/components/shared/layout/header';

export default function CollectEmojiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header backHref="/explore" className="mb-6" />
      {children}
    </>
  );
}
