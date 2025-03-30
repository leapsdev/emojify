'use client';

import { AuthRedirect } from '@/components/features/auth/authRedirect';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen pt-14 overflow-x-hidden">
      <AuthRedirect mode="auth" />
      {children}
    </main>
  );
}
