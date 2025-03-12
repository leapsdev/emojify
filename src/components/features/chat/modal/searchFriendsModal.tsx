'use client';

import type { User } from '@/components/features/chat/shared/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserList } from './components/userList';

const SUGGESTED_USERS: User[] = [
  {
    id: '1',
    name: 'Kinjo',
    username: 'illshin',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '2',
    name: 'yamapyblack',
    username: 'yamapyblack',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '3',
    name: 'Ritulya',
    username: 'babushka',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '4',
    name: 'toto 🎭🐷💜🧀💧🍭💛',
    username: 'totomal',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '5',
    name: 'tantan777 🎭',
    username: 'tantan777',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '6',
    name: 'Yuki Sato',
    username: 'yukisato.eth',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '7',
    name: 'DENJIN-K',
    username: 'denjin',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '8',
    name: 'passion 😎',
    username: 'hyde2000',
    avatar: '/placeholder.svg?height=48&width=48',
  },
  {
    id: '9',
    name: '0xTouYan',
    username: '0xtouyan.eth',
    avatar: '/placeholder.svg?height=48&width=48',
  },
];

interface SearchFriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchFriendsModal({
  open,
  onOpenChange,
}: SearchFriendsModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleChatStart = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  const handleSkip = () => {
    onOpenChange(false);
    router.push('/chat');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!rounded-[24px] w-[min(90vw,32rem)] p-0 bg-white">
        <DialogTitle className="sr-only">Search Friends</DialogTitle>

        <div className="p-6 space-y-6">
          {/* ヘッダー部分 */}
          <div className="relative">
            <div className="text-center">
              <div className="text-2xl">👦👧</div>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="text-2xl absolute right-8 top-1/2 -translate-y-1/2"
              aria-label="Skip"
            >
              👉
            </button>
          </div>

          {/* ユーザーリスト */}
          <div className="max-h-[60vh] overflow-y-auto">
            <UserList
              users={SUGGESTED_USERS}
              selectedUsers={selectedUsers}
              onUserSelect={handleUserSelect}
              onChatStart={handleChatStart}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
