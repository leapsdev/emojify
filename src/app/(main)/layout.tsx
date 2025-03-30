'use client';

import { AuthRedirect } from '@/components/features/auth/authRedirect';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="pt-14">
      <AuthRedirect mode="auth" />
      {children}
    </main>
  );
}
