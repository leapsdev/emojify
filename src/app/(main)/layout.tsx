import { AuthRedirect } from '@/components/features/auth/authRedirect';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="pt-14">
      <AuthRedirect mode="auth" />
      {children}
    </main>
  );
}
