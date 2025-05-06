import { Header } from '@/components/shared/layout/Header';

export default function ChooseFriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        backHref="/chat"
        centerContent={<span className="text-2xl">👦👧</span>}
      />
      {children}
    </>
  );
}
