import { AuthRedirect } from '@/components/features/auth/AuthRedirect';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <AuthRedirect mode="auth" />
      {children}
    </main>
  );
}
