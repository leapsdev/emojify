'use client';

import { AuthRedirect } from '@/components/features/auth/authRedirect';
import { FooterNavigation } from '@/components/shared/navigation/footerNavigation';
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showFooter = !pathname.includes('/chat/');

  return (
    <main>
      <AuthRedirect mode="auth" />
      <div className="min-h-screen flex flex-col bg-white">
        {children}
        {showFooter && <FooterNavigation />}
      </div>
    </main>
  );
}
