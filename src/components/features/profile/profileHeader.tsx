'use client';

import { MoreVertical } from 'lucide-react';
import Link from 'next/link';

export const ProfileHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <Link href="/chat" className="text-2xl">
        👈
      </Link>
      <div className="w-6" /> {/* スペーサー */}
      <button type="button" className="text-black">
        <MoreVertical className="w-6 h-6" />
      </button>
    </div>
  );
};
