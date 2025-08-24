import { AuthRedirect } from '@/components/features/auth/AuthRedirect';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="pt-14">
      {/* <AuthRedirect mode="auth" /> */}
      {children}
    </main>
  );
}
