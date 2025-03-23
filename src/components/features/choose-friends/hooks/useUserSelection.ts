import { subscribeToUsersAction } from '@/components/features/choose-friends/actions';
import type { User } from '@/types/database';
import type { DisplayUser } from '@/types/display';
import { useEffect, useState } from 'react';

interface UseUserSelectionProps {
  currentUserId: string;
}

function convertToDisplayUser(
  user: User,
  section: 'friend' | 'other',
): DisplayUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.username,
    userId: user.id,
    avatar: '/placeholder.svg?height=48&width=48',
    section,
  };
}

export const useUserSelection = ({ currentUserId }: UseUserSelectionProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<DisplayUser[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToUsersAction(
      currentUserId,
      ({ friends, others }) => {
        const newUsers = [
          ...friends.map((user) => convertToDisplayUser(user, 'friend')),
          ...others.map((user) => convertToDisplayUser(user, 'other')),
        ];
        setUsers(newUsers);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const friends = filteredUsers.filter((user) => user.section === 'friend');
  const others = filteredUsers.filter((user) => user.section === 'other');

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    friends,
    others,
    handleUserSelect,
  };
};
