import Link from 'next/link';

export const FooterNavigation = () => {
  return (
    <div className="border-t py-3 px-6">
      <div className="flex justify-between items-center">
        <Link href="/chat" className="text-blue-600">
          <span className="text-2xl">💬</span>
        </Link>
        <Link href="/search" className="text-gray-400">
          <span className="text-2xl">🔍</span>
        </Link>
        <Link href="/new" className="text-gray-400">
          <span className="text-2xl">🤪</span>
        </Link>
        <Link href="/notifications" className="text-gray-400">
          <span className="text-2xl">🔔</span>
        </Link>
        <Link href="/profile" className="text-gray-400">
          <span className="text-2xl">🙎‍♂️</span>
        </Link>
      </div>
    </div>
  );
};
