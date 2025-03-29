import { Header } from '@/components/shared/layout/header';

export default function ProfileEditLayout({
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
