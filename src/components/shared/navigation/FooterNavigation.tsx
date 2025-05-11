'use client';
import { usePathname } from 'next/navigation';
import { FooterNavigationItem } from './FooterNavigationItem';

export const FooterNavigation = () => {
  const pathName = usePathname();

  const itemMap = [
    {
      href: '/chat',
      iconSrc: '/chat-bubble-icon.png',
      alt: 'Chat',
    },
    {
      href: '/explore',
      iconSrc: '/black-search-icon.png',
      alt: 'Search',
    },
    {
      href: '/create-emoji',
      iconSrc: '/black-plus-icon.png',
      alt: 'Create',
    },
    {
      href: '/profile',
      iconSrc: '/black-user-icon.png',
      alt: 'Profile',
    },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center transition-transform duration-300">
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
