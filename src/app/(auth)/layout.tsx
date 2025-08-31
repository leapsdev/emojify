import { AuthRedirect } from '@/components/features/auth/AuthRedirect';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-white min-h-screen">
      <AuthRedirect mode="auth" />
      {children}
    </main>
  );
}
