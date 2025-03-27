import { useEffect, useState } from 'react';
import Link from 'next/link';

export const FooterNavigation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`fixed bottom-0 w-full border-t py-3 px-6 bg-white transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex justify-between items-center">
        <Link href="/search-emoji" className="text-gray-400">
          <span className="text-2xl">🔍</span>
        </Link>
        <Link href="/create-emoji" className="text-gray-400">
          <span className="text-2xl">🤪</span>
        </Link>
        <Link href="/profile" className="text-gray-400">
          <span className="text-2xl">🙎‍♂️</span>
        </Link>
      </div>
    </div>
  );
};
