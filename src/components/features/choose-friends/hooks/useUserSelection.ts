'use client';

import { getUsersWithFriendshipAction } from '@/components/features/choose-friends/actions';
import { db } from '@/repository/db/config/client';
import type { User } from '@/repository/db/database';
import { onValue, ref } from 'firebase/database';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

interface DisplayUser extends Pick<User, 'username'> {
  id: string; // ウォレットアドレス (UIのkey用)
  displayName: string;
  walletAddress: string;
  avatar: string;
  section: 'friend' | 'other';
}

interface UseUserSelectionProps {
  currentWalletAddress: string;
  initialFriends?: Array<User & { walletAddress: string }>;
  initialOthers?: Array<User & { walletAddress: string }>;
}

// ユーザー情報をDisplayUser形式に変換
function convertToDisplayUser(
  user: User,
  walletAddress: string,
  section: 'friend' | 'other',
): DisplayUser {
  return {
    id: walletAddress,
    username: user.username,
    displayName: user.username,
    walletAddress: walletAddress,
    avatar: user.imageUrl || '/icons/faceIcon-192x192.png',
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
  initialFriends: Array<User & { walletAddress: string }>,
  initialOthers: Array<User & { walletAddress: string }>,
): UserList {
  return {
    users: [
      ...initialFriends.map((user) =>
        convertToDisplayUser(user, user.walletAddress, 'friend'),
      ),
      ...initialOthers.map((user) =>
        convertToDisplayUser(user, user.walletAddress, 'other'),
      ),
    ],
    friends: initialFriends.map((user) =>
      convertToDisplayUser(user, user.walletAddress, 'friend'),
    ),
    others: initialOthers.map((user) =>
      convertToDisplayUser(user, user.walletAddress, 'other'),
    ),
  };
}

export const useUserSelection = ({
  currentWalletAddress,
  initialFriends = [],
  initialOthers = [],
}: UseUserSelectionProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 初期ユーザーリストをメモ化
  const initialUserList = useMemo(
    () => createUserList(initialFriends, initialOthers),
    [initialFriends, initialOthers],
  );

  // ユーザーリストを参照で管理
  const userListRef = useRef<UserList>(initialUserList);

  // ユーザーリストの購読
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!currentWalletAddress) {
        userListRef.current = createUserList([], []);
        callback();
        return () => {};
      }

      // ユーザーリストの変更を監視
      const dbRef = ref(db, 'users');
      const unsubscribe = onValue(dbRef, async () => {
        try {
          const { friends, others } =
            await getUsersWithFriendshipAction(currentWalletAddress);
          userListRef.current = {
            friends: friends.map((user) =>
              convertToDisplayUser(user, user.walletAddress, 'friend'),
            ),
            others: others.map((user) =>
              convertToDisplayUser(user, user.walletAddress, 'other'),
            ),
            users: [
              ...friends.map((user) =>
                convertToDisplayUser(user, user.walletAddress, 'friend'),
              ),
              ...others.map((user) =>
                convertToDisplayUser(user, user.walletAddress, 'other'),
              ),
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
    [currentWalletAddress, initialUserList],
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
      user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // フィルタリングされたユーザーを友達とその他に分類
  const friends = filteredUsers.filter((user) => user.section === 'friend');
  const others = filteredUsers.filter((user) => user.section === 'other');

  // ユーザーの選択状態を切り替え
  const handleUserSelect = useCallback((walletAddress: string) => {
    setSelectedUsers((prev) =>
      prev.includes(walletAddress)
        ? prev.filter((id) => id !== walletAddress)
        : [...prev, walletAddress],
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
