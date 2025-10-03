export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="bg-white min-h-screen">{children}</main>;
}
