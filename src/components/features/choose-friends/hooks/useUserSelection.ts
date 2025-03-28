'use client';

import { getUsersWithFriendshipAction } from '@/components/features/choose-friends/actions';
import { db } from '@/lib/firebase/client';
import type { User } from '@/types/database';
import type { DisplayUser } from '@/types/display';
import { onValue, ref } from 'firebase/database';
import { useCallback, useRef, useState, useSyncExternalStore, useMemo } from 'react';

interface UseUserSelectionProps {
  currentUserId: string;
  initialFriends?: User[];
  initialOthers?: User[];
}

// ユーザー情報をDisplayUser形式に変換
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

// ユーザーリストの型
interface UserList {
  users: DisplayUser[];
  friends: DisplayUser[];
  others: DisplayUser[];
}

// 初期ユーザーリストを作成
function createUserList(
  initialFriends: User[],
  initialOthers: User[],
): UserList {
  return {
    users: [
      ...initialFriends.map((user) => convertToDisplayUser(user, 'friend')),
      ...initialOthers.map((user) => convertToDisplayUser(user, 'other')),
    ],
    friends: initialFriends.map((user) => convertToDisplayUser(user, 'friend')),
    others: initialOthers.map((user) => convertToDisplayUser(user, 'other')),
  };
}

export const useUserSelection = ({
  currentUserId,
  initialFriends = [],
  initialOthers = [],
}: UseUserSelectionProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 初期ユーザーリストをメモ化
  const initialUserList = useMemo(
    () => createUserList(initialFriends, initialOthers),
    [initialFriends, initialOthers]
  );

  // ユーザーリストを参照で管理
  const userListRef = useRef<UserList>(initialUserList);

  // ユーザーリストの購読
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!currentUserId) {
        userListRef.current = createUserList([], []);
        callback();
        return () => {};
      }

      // ユーザーリストの変更を監視
      const dbRef = ref(db, 'users');
      const unsubscribe = onValue(dbRef, async () => {
        try {
          const { friends, others } =
            await getUsersWithFriendshipAction(currentUserId);
          userListRef.current = {
            friends: friends.map((user) =>
              convertToDisplayUser(user, 'friend'),
            ),
            others: others.map((user) => convertToDisplayUser(user, 'other')),
            users: [
              ...friends.map((user) => convertToDisplayUser(user, 'friend')),
              ...others.map((user) => convertToDisplayUser(user, 'other')),
            ],
          };
          callback();
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      });

      return () => {
        unsubscribe();
        userListRef.current = initialUserList;
      };
    },
    [currentUserId, initialUserList],
  );

  // 現在のユーザーリストを返す
  const getSnapshot = useCallback(() => {
    return userListRef.current.users;
  }, []);

  // サーバーレンダリング時は初期値を返す
  const getServerSnapshot = useCallback(() => {
    return initialUserList.users;
  }, [initialUserList]);

  // ユーザーリストを購読
  const users = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // 検索クエリに基づいてユーザーをフィルタリング
  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // フィルタリングされたユーザーを友達とその他に分類
  const friends = filteredUsers.filter((user) => user.section === 'friend');
  const others = filteredUsers.filter((user) => user.section === 'other');

  // ユーザーの選択状態を切り替え
  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }, []);

  return {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    friends,
    others,
    handleUserSelect,
  };
};
