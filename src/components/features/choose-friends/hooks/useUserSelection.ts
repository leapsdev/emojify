import { useState } from 'react';

interface User {
  id: string;
  displayName: string;
  userId: string;
  avatar: string;
  section: 'recent' | 'favorites' | 'friends';
}

const USERS: User[] = [
  {
    id: '1',
    displayName: 'Kinjo',
    userId: 'illshin',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'recent',
  },
  {
    id: '2',
    displayName: 'yamapyblack',
    userId: 'yamapyblack',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
  {
    id: '3',
    displayName: 'Ritulya',
    userId: 'babushka',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
  {
    id: '4',
    displayName: 'toto 🎭🐷💜🧀💧🍭💛',
    userId: 'totomal',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
  {
    id: '5',
    displayName: 'tantan777 🎭',
    userId: 'tantan777',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
  {
    id: '6',
    displayName: 'Yuki Sato',
    userId: 'yukisato.eth',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
  {
    id: '7',
    displayName: 'DENJIN-K',
    userId: 'denjin',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
  {
    id: '8',
    displayName: 'passion 😎',
    userId: 'hyde2000',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
  {
    id: '9',
    displayName: '0xTouYan',
    userId: '0xtouyan.eth',
    avatar: '/placeholder.svg?height=48&width=48',
    section: 'friends',
  },
];

export const useUserSelection = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = USERS.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentChats = filteredUsers.filter((user) => user.section === 'recent');
  const favorites = filteredUsers.filter((user) => user.section === 'favorites');
  const friends = filteredUsers.filter((user) => user.section === 'friends');

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    recentChats,
    favorites,
    friends,
    handleUserSelect,
  };
};
