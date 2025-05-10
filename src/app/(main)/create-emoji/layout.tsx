import { Header } from '@/components/shared/layout/Header';

export default function CreateEmojiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header backHref="/chat" className="mb-6" />
      {children}
    </>
  );
}
