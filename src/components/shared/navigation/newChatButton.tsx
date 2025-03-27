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
      className={`fixed right-4 bottom-20 bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span className="text-2xl">💬</span>
    </Link>
  );
};
