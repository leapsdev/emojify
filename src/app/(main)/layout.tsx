'use client';

import { AuthRedirect } from '@/components/features/auth/authRedirect';
import EthereumProviders from '@/lib/basename/EthereumProviders';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="pt-14">
      <AuthRedirect mode="auth" />
      <EthereumProviders>{children}</EthereumProviders>
    </main>
  );
}
