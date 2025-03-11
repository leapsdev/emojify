'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SearchFriendsModal } from '../modal/searchFriendsModal';

export const FooterNavigation = () => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <>
      <div className="border-t py-3 px-6">
        <div className="flex justify-between items-center">
          <Link href="/chat" className="text-blue-600">
            <span className="text-2xl">💬</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="text-gray-400"
          >
            <span className="text-2xl">🔍</span>
          </button>
          <Link href="/create-emoji" className="text-gray-400">
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

      <SearchFriendsModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </>
  );
};
