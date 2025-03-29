import { Header } from '@/components/shared/layout/header';
import { ProfileMenu } from './components/profileMenu';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header backHref="/chat" rightContent={<ProfileMenu />} />
      {children}
    </>
  );
}
