import { Header } from '@/components/shared/layout/header';

export default function CreateEmojiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        backHref="/chat"
        centerContent={<div className="text-4xl">🤪</div>}
        className="mb-6"
      />
      {children}
    </>
  );
}
