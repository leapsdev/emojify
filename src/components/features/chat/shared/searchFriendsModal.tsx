'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import type { SearchFriendsModalProps, User } from './types';

const DUMMY_USERS: User[] = [
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

export function SearchFriendsModal({
  open,
  onOpenChange,
}: SearchFriendsModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = DUMMY_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-0 max-w-md mx-auto border-0 sm:rounded-lg">
        <div className="h-full flex flex-col">
          {/* 検索バー */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-10 pr-4 py-6 bg-gray-100 border-none rounded-full text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* ユーザーリスト */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.avatar || '/placeholder.svg'}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.username}</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserSelect(user.id)}
                    className="h-6 w-6 rounded-full border-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
