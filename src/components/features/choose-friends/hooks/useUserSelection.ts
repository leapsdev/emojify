import { useState } from 'react';
import { toast } from 'sonner';

import { addFriendAction } from '../actions';
import { usePrivyId } from '@/hooks/usePrivyId';
import { DisplayUser } from '@/types/display';
import { User } from '@/types/database';

// テストデータ（実際のUser型に近い形で定義）
const TEST_USERS: User[] = [
  {
    id: '1',
    email: 'kinjo@example.com',
    username: 'Kinjo',
    bio: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    email: 'yamapyblack@example.com',
    username: 'yamapyblack',
    bio: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    friends: {
      '1': { createdAt: Date.now() }
    }
  },
  {
    id: '3',
    email: 'babushka@example.com',
    username: 'Ritulya',
    bio: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    friends: {
      '1': { createdAt: Date.now() }
    }
  }
];

// 表示用のユーザーデータに変換
const USERS: DisplayUser[] = TEST_USERS.map(user => ({
  id: user.id,
  username: user.username,
  displayName: user.username,
  userId: user.id,
  avatar: '/placeholder.svg?height=48&width=48',
  section: user.friends ? 'friend' : 'other'
}));

export const useUserSelection = () => {
  const userId = usePrivyId();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<DisplayUser[]>(USERS);

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

  const handleAddFriend = async (friendId: string) => {
    if (!userId) {
      toast.error('ユーザーIDが取得できません');
      return;
    }

    setIsLoading(true);
    try {
      const result = await addFriendAction(userId, friendId);
      if (result.success) {
        // 新しい配列を作成して状態を更新
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === friendId
              ? { ...user, section: 'friend' }
              : user
          )
        );
        toast.success('友達に追加しました');
      } else {
        toast.error(result.error || '友達の追加に失敗しました');
      }
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    friends,
    others,
    handleUserSelect,
    handleAddFriend,
    isLoading,
  };
};
