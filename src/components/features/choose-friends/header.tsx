import Link from 'next/link';

export function Header() {
  return (
    <div className="relative flex items-center justify-center p-4 border-b">
      <Link href="/chat" className="text-2xl absolute left-4">
        👈
      </Link>
      <span className="text-2xl">👦👧</span>
    </div>
  );
}
