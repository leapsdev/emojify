import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { addFriendAction, getUsersWithFriendshipAction } from '../actions';
import { usePrivyId } from '@/hooks/usePrivyId';
import { DisplayUser } from '@/types/display';
import { User } from '@/types/database';

/**
 * UserをDisplayUser型に変換するヘルパー関数
 */
function convertToDisplayUser(user: User, section: 'friend' | 'other'): DisplayUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.username,
    userId: user.id,
    avatar: '/placeholder.svg?height=48&width=48',
    section,
  };
}

export const useUserSelection = () => {
  const userId = usePrivyId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<DisplayUser[]>([]);

  // ユーザー一覧を取得
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getUsersWithFriendshipAction(userId);
        if (result.success && result.friends && result.others) {
          const displayUsers = [
            ...result.friends.map(user => convertToDisplayUser(user, 'friend')),
            ...result.others.map(user => convertToDisplayUser(user, 'other')),
          ];
          setUsers(displayUsers);
        } else {
          setError(result.error || 'ユーザー一覧の取得に失敗しました');
          toast.error(result.error || 'ユーザー一覧の取得に失敗しました');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'ユーザー一覧の取得に失敗しました';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [userId]);

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
    error,
  };
};
