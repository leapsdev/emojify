'use client';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FooterNavigationItem } from './FooterNavigationItem';

export const FooterNavigation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const pathName = usePathname();

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

  const itemMap = [
    {
      href: '/chat',
      iconSrc: '/chat-bubble-icon.png',
      alt: 'Chat',
    },
    {
      href: '/explore',
      iconSrc: '/blue-search-icon.png',
      alt: 'Search',
    },
    {
      href: '/create-emoji',
      iconSrc: '/green-plus-icon.png',
      alt: 'Create',
    },
    {
      href: '/profile',
      iconSrc: '/green-user-icon.png',
      alt: 'Profile',
    },
  ];

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 flex justify-center transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center justify-between w-[320px]">
        {itemMap.map((item) => (
          <FooterNavigationItem
            key={item.href}
            href={item.href}
            iconSrc={item.iconSrc}
            alt={item.alt}
            isActive={pathName === item.href}
          />
        ))}
      </div>
    </div>
  );
};
