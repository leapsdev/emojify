'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export const NewChatButton = () => {
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
    <Link
      href="/choose-friends"
      className={`
        fixed right-4 bottom-20
        w-14 h-14
        bg-blue-500 hover:bg-blue-600
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        active:scale-95
      `}
    >
      <Image src="/chat-bubble-icon.png" alt="Chat" width={28} height={28} />
    </Link>
  );
};
