'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export const FooterNavigation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const debouncedScrollEnd = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    setTimeoutId(newTimeout);
  }, [timeoutId]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(false);
      debouncedScrollEnd();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [debouncedScrollEnd]);

  return (
    <div
      className={`fixed bottom-6 left-0 right-0 flex justify-center transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white rounded-full shadow-lg px-6 py-4 flex items-center justify-between w-[320px]">
        <Link
          href="/chat"
          className="flex items-center justify-center p-2 bg-blue-100 rounded-full"
        >
          <div className="w-7 h-7 relative">
            <Image
              src="/chat-bubble-icon.png"
              alt="Chat"
              fill
              className="object-contain"
            />
          </div>
        </Link>
        <Link href="/explore" className="flex items-center justify-center p-2">
          <Image
            src="/blue-search-icon.png"
            alt="Search"
            width={28}
            height={28}
          />
        </Link>
        <Link
          href="/create-emoji"
          className="flex items-center justify-center p-2"
        >
          <Image
            src="/green-plus-icon.png"
            alt="Create"
            width={28}
            height={28}
          />
        </Link>
        <Link href="/profile" className="flex items-center justify-center p-2">
          <Image
            src="/green-user-icon.png"
            alt="Profile"
            width={28}
            height={28}
          />
        </Link>
      </div>
    </div>
  );
};
