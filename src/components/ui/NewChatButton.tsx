'use client';

import Image from 'next/image';
import Link from 'next/link';

export const NewChatButton = () => {
  return (
    <Link
      href="/choose-friends"
      className={`
        fixed right-4 bottom-[82px]
        w-14 h-14
        bg-blue-500 hover:bg-blue-600
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        opacity-100 translate-y-0
        active:scale-95
      `}
    >
      <Image src="/chat-bubble-icon.png" alt="Chat" width={28} height={28} />
    </Link>
  );
};
