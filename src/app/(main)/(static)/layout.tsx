import { Header } from '@/components/shared/layout/header';

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
