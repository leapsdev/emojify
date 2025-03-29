'use client';

import { AuthRedirect } from '@/components/features/auth/authRedirect';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <AuthRedirect mode="auth" />
      <div className="min-h-screen flex flex-col bg-white">{children}</div>
    </main>
  );
}
