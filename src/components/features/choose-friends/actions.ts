'use client';

import { db } from '@/lib/firebase/client';
import { createChatRoom } from '@/repository/chat/actions';
import { addFriend } from '@/repository/user/actions';
import type { User } from '@/types/database';
import { off, onValue, ref } from 'firebase/database';

const USERS_PATH = 'users';

/**
 * フレンドを追加
 */
export async function addFriendAction(userId: string, friendId: string) {
  try {
    await addFriend(userId, friendId);
    return { success: true };
  } catch (error) {
    console.error('Failed to add friend:', error);
    return { success: false, error: 'Failed to add friend' };
  }
}

/**
 * チャットルームを作成
 */
export async function createChatRoomAction(members: string[]) {
  try {
    const roomId = await createChatRoom(members);
    return { success: true, roomId };
  } catch (error) {
    console.error('Failed to create chat room:', error);
    return { success: false, error: 'Failed to create chat room' };
  }
}

/**
 * ユーザー一覧をリアルタイムで購読
 */
export function subscribeToUsersAction(
  currentUserId: string,
  onUsers: (data: { friends: User[]; others: User[] }) => void,
): () => void {
  const usersRef = ref(db, USERS_PATH);

  const unsubscribe = onValue(usersRef, (snapshot) => {
    const users = snapshot.val() as Record<string, User> | null;
    if (!users) {
      onUsers({ friends: [], others: [] });
      return;
    }

    const currentUser = users[currentUserId];
    if (!currentUser) {
      onUsers({ friends: [], others: [] });
      return;
    }

    const friends: User[] = [];
    const others: User[] = [];

    // 自分以外のユーザーを友達かどうかで振り分け
    Object.values(users).forEach((user) => {
      if (user.id === currentUserId) return;

      if (currentUser.friends?.[user.id]) {
        friends.push(user);
      } else {
        others.push(user);
      }
    });

    // 更新日時でソート
    onUsers({
      friends: friends.sort((a, b) => b.updatedAt - a.updatedAt),
      others: others.sort((a, b) => b.updatedAt - a.updatedAt),
    });
  });

  return () => {
    off(usersRef);
    unsubscribe();
  };
}
