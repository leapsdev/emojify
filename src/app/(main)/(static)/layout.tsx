import { Header } from '@/components/shared/layout/Header';

export default function StaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header backHref="/profile" />
      {children}
    </>
  );
}
