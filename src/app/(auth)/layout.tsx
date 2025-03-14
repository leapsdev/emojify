import { AuthRedirect } from '@/components/features/auth/authRedirect';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <AuthRedirect mode="auth" />
      {children}
    </main>
  );
}
